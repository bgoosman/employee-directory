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
const defaultLimit = 15;

function getStringFilter(fieldName, searchPrefix) {
  return searchPrefix ? `and ${fieldName} like '${searchPrefix}%'` : "";
}

async function getEmployees(sql, filter, first, after) {
  const andName = getStringFilter("name", filter["name"]);
  const andEmail = getStringFilter("email", filter["email"]);
  const andTitle = getStringFilter("title", filter["title"]);
  const andDepartment = getStringFilter("department", filter["department"]);
  const andNameAfter = after ? `and name > '${after}'` : "";
  const limit = first ? `limit ${first}` : `limit ${defaultLimit}`;
  // TODO: in production, I would find a different library that supported
  // dynamic where clauses and template literals, but at this point
  // it didn't feel worth switching libraries
  const totalCount = await sql.unsafe(`
    select COUNT(*) from employees
    where 1=1
      ${andName}
      ${andEmail}
      ${andTitle}
      ${andDepartment}
  `);
  const employees = await sql.unsafe(`
    select * from employees
    where 1=1
      ${andName}
      ${andEmail}
      ${andTitle}
      ${andDepartment}
      ${andNameAfter}
    order by name asc
    ${limit}
  `);
  return Promise.resolve({
    totalCount: totalCount[0]["count"],
    edges: employees.map((employee) => {
      return {
        node: employee,
        cursor: employee["name"],
      };
    }),
    pageInfo: {
      endCursor:
        employees.length > 0 ? employees[employees.length - 1]["name"] : "",
    },
  });
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
  defaultLimit,
  getStringFilter,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
