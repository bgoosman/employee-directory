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
