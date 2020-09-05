# Planning

    ```
    Frontend
    * Bundling: snowpack came out in 2019 replaces webpack as a code bundler
    * UI framework: Bootstrap 5 alpha?
    * View framework: React
    * JavaScript runtime: Node
    * Animation: Framer Motion
      <motion.div
          animate={{
          x: 26,
          y: -84,
          scale: 0.5,
          rotate: 86,
      }}
    />
    * TypeScript or JavaScript: JavaScript. Faster to prototype w/out types + haven’t written a whole app in JS, since I started with TS at Expedia.
    * Testing: Jest

    Backend
    * Web framework: expressjs
    * Database: PostreSQL (because Heroku has a free db)
    * API: GraphQL

    Requirements
    * List employees
    * Filter employees by name, department, title
    * Add employee
    * Update employee
    * Delete employees
    ```

# Diary

## 2020-09-02

1. I need a database. Installed [docker](https://hub.docker.com/editions/community/docker-ce-desktop-mac/)
2. Pull the postgres image
   ```
   docker pull postgres
   ```
3. Start postgres. Refer to the app as empdir because I don't like typing long names
   ```
   docker run --name empdir -e POSTGRES_PASSWORD=empdir postgres
   ```
4. Realize I'll want to run the db, frontend, and backend service in Docker. Let's use [docker-compose](https://github.com/docker/compose). Here's a [tutorial](https://medium.com/@wkrzywiec/how-to-run-database-backend-and-frontend-in-a-single-click-with-docker-compose-4bcda66f6de).
5. Need a github repo to store this all in. Created https://github.com/bgoosman/empdir

   ```
   ➜  employee-directory git:(master) ✗ cat docker-compose.yml
   version: "3.8"
   services:
     db:
       image: postgres
       restart: always
       environment:
         POSTGRES_PASSWORD: empdir

     adminer:
       image: adminer
       restart: always
       ports:
         - 8080:8080
   ➜  employee-directory git:(master) ✗ docker-compose up
   ```

6. I need a database model. https://randomuser.me/ provides a lot of data, but I'm only interested in name, email, dob, phone, id, and picture. The challenge recommends adding department and title to that. We can generate those randomly during ingest. It's easy to generate one user:`GET 'https://randomuser.me/api/'`. We'll create 5,000 to stay in Heroku's free tier and choose department (Aardvark, Gingko, Qi) and title https://www.randomlists.com/random-jobs?dup=false&qty=40. Let's generate that dataset.

## 2020-09-03

7. Created scripts/make-database.js. Use the [postgres module](https://github.com/porsager/postgres) and [axios](https://github.com/axios/axios) to simultaneously create random users and then store them.

   ```
   const axios = require("axios");
   const postgres = require("postgres");

   async function getRandomUsers(count) {
     try {
       const response = await axios.get(
         `http://randomuser.me/api/?results=${count}`
       );
       return response.data.results;
     } catch (error) {
       console.error(error);
     }
   }

   const departments = {
     Aardvark: ["Dental Hygienist", "Civil Engineer", "Writer", "Hairdresser"],
     Gingko: [
       "Insurance Agent",
       "Court Reporter",
       "Paramedic",
       "Real Estate Agent",
     ],
     Qi: ["Editor", "Executive Assistant", "Zoologist", "Plumber"],
   };
   const departmentKeys = Object.keys(departments);

   function userToEmployee(user) {
     const randomDepartment =
       departmentKeys[(departmentKeys.length * Math.random()) << 0];
     const titles = departments[randomDepartment];
     const randomTitle = titles[(titles.length * Math.random()) << 0];
     return {
       id: user["login"]["uuid"],
       name: `${user["name"]["first"]} ${user["name"]["last"]}`,
       email: user["email"],
       dob: user["dob"]["date"],
       phone: user["phone"],
       picture: user["picture"],
       department: randomDepartment,
       title: randomTitle,
     };
   }

   async function generateRandomEmployees(employeeCount) {
     const users = await getRandomUsers(employeeCount);
     const data = [];
     for (let i = 0; i < users.length; i++) {
       data.push(userToEmployee(users[i]));
     }
     return data;
   }

   export async function makeDatabase(employeeCount) {
     const sql = postgres();
     await sql`DROP TABLE employees`;
     await sql`CREATE TABLE employees (
       id varchar PRIMARY KEY,
       name varchar,
       email varchar,
       dob varchar,
       phone varchar,
       picture jsonb,
       department varchar,
       title varchar
     )`;
     const employees = await generateRandomEmployees(employeeCount);
     for (const employee of employees) {
       await sql`
         INSERT INTO employees(
           id, name, email, dob, phone, picture, department, title)
         VALUES (
           ${employee["id"]},
           ${employee["name"]},
           ${employee["email"]},
           ${employee["dob"]},
           ${employee["phone"]},
           ${sql.json(employee["picture"])},
           ${employee["department"]},
           ${employee["title"]}
         )
       `;
     }
   }
   ```

8. I want to run all of this in a docker container, and knowing this backend folder will be a Node app, I followed [these instructions](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/). This also allows us to quickly set [magic env variables that postgres js uses](https://github.com/porsager/postgres#environment-variables-for-options). Since this is all going in GraphQL anyway, let's add a route to the GraphQL server just for making the database. In src/server.js:

   ```
   import { GraphQLServer } from "graphql-yoga";

   const typeDefs = `
     type Query {
       hello(name: String): String!
     }
   `;

   const resolvers = {
     Query: {
       hello: (_, { name }) => `Hello ${name || "World"}`,
     },
   };

   const server = new GraphQLServer({ typeDefs, resolvers });
   server.start(() => console.log("Server is running on localhost:4000"));

   server.express.route("/make-database", () => {
     try {
       await makeDatabase(5);
       res.send("Done!");
     } catch (e) {
       res.send(e);
     }
   });
   ```

   We need esm to use ECMAScript modules, so install that first `npm i esm --save`. Now create the backend/Dockerfile

   ```
   FROM node:12

   WORKDIR /usr/src/app

   COPY package*.json ./

   RUN npm install

   COPY . .

   EXPOSE 3030

   CMD [ "node", "-r", "esm", "src/server.js" ]
   ```

   Now we can run our server, but first add this to docker-compose.yml.

   ```
   backend:
    image: bgoosman/employee-directory-backend
    environment:
      PGHOST: host.docker.internal
      PGPORT: 5432
      PGUSER: postgres
      PGPASSWORD: employee-directory-postgres-password
    ports:
      - 4000:4000
   ```

   ```
   ➜  backend git:(master) ✗ pwd
   /Users/admin/code/employee-directory/backend
   ➜  backend git:(master) ✗ cd ..
   ➜  employee-directory git:(master) ✗ docker build -t bgoosman/employee-directory-backend ./backend && docker-compose up
   ...

   ```

   Execute a GET http://localhost:4000/make-database.
   ![](postgres.png)

## 2020-09-04

1. I got sick of rebuilding my docker containers for every code change. Fortunately [there is hope](https://medium.com/better-programming/docker-in-development-with-nodemon-d500366e74df). I added the following to my backend service in docker-compose.yml.
   ```
   command: npx nodemon -r esm src/server.js
   ...
   volumes:
     - ./backend:/usr/src/app
   ```
   Fresh air:
   ```
   backend_1  | [nodemon] restarting due to changes...
   backend_1  | [nodemon] starting `node -r esm src/server.js`
   backend_1  | Server is running on localhost:4000
   ```
2. Need to get employees.
