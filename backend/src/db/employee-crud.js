import { v4 as uuidv4 } from "uuid";

const primaryKey = "id";
const updateableAttributes = [
  "name",
  "email",
  "dob",
  "phone",
  "picture_thumbnail",
  "department",
  "title",
];

function getStringFilter(fieldName, searchPrefix) {
  return searchPrefix ? `and ${fieldName} like '${searchPrefix}%'` : "";
}

// TODO: pagination? https://graphql.org/learn/pagination/ & https://relay.dev/graphql/connections.htms
async function getEmployees(sql, filter) {
  const andName = getStringFilter("name", filter["name"]);
  const andEmail = getStringFilter("email", filter["email"]);
  const andTitle = getStringFilter("title", filter["title"]);
  const andDepartment = getStringFilter("department", filter["department"]);
  // TODO: in production, I would find a different library that supported
  // dynamic where clauses and template literals, but at this point
  // it didn't feel worth switching libraries
  const employees = await sql.unsafe(`
    select * from employees
    where 1=1 ${andName} ${andEmail} ${andTitle} ${andDepartment}
  `);
  return employees;
}

async function createEmployee(sql, input) {
  input["id"] = uuidv4();
  await sql`
    insert into employees ${sql(input, primaryKey, ...updateableAttributes)}
  `;
  return input;
}

async function updateEmployee(sql, input) {
  // TODO: allow partial updates?
  const result = await sql`
    update employees set ${sql(input, ...updateableAttributes)} 
    where id = ${input[primaryKey]}
  `;
  if (!result.count) {
    throw new Error("Employee does not exist.");
  }
  return input;
}

async function deleteEmployee(sql, input) {
  const result = await sql`
    delete from employees
    where id = ${input[primaryKey]}
  `;
  return { count: result.count };
}

export {
  getStringFilter,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
