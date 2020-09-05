import { GraphQLServer } from "graphql-yoga";
import { makeDatabase } from "./db/make-database";
import { getEmployees } from "./db/employee-crud";

const typeDefs = `
  type Query {
    employees: [Employee!]!
  }

  type Employee {
    id: String!
    name: String!
    email: String!
    dob: String!
    phone: String!
    picture_thumbnail: String!
    department: String!
    title: String! 
  }
`;

const resolvers = {
  Query: {
    employees: () => getEmployees(),
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));

server.express.get("/make-database", async (req, res) => {
  try {
    await makeDatabase(5);
    res.send("Done!");
  } catch (e) {
    res.send(e);
  }
});
