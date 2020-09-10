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

async function getEmployees(sql, filter, first, after, last, before) {
  const andNameStartsWith = getStringFilter("name", filter["name"]);
  const andEmailStartsWith = getStringFilter("email", filter["email"]);
  const andTitleStartsWith = getStringFilter("title", filter["title"]);
  const andDepartmentStartsWith = getStringFilter("department", filter["department"]);
  let limit = `limit ${defaultLimit}`,
      andNameAfter = '',
      orderBy = 'order by name asc';
  if (first) {
    limit = `limit ${first}`
    if (after) {
      andNameAfter = `and name > '${after}'`;
    }
  } else if (last) {
    limit = `limit ${last}`
    orderBy = 'order by name desc';
    if (before) {
      andNameAfter = `and name < '${before}'`
    }
  }
  // TODO: in production, I would find a different library that supported
  // dynamic where clauses and template literals, but at this point
  // it didn't feel worth switching libraries
  const totalCount = await sql.unsafe(`
    select COUNT(*) from employees
    where 1=1
      ${andNameStartsWith}
      ${andEmailStartsWith}
      ${andTitleStartsWith}
      ${andDepartmentStartsWith}
  `);
  const employees = await sql.unsafe(`
    select * from employees
    where 1=1
      ${andNameStartsWith}
      ${andEmailStartsWith}
      ${andTitleStartsWith}
      ${andDepartmentStartsWith}
      ${andNameAfter}
    ${orderBy}
    ${limit}
  `);
  const reversed = last && before // to get the last x employees before a cursor, we had to reverse order the results
  return Promise.resolve({
    totalCount: totalCount[0]["count"],
    edges: employees.map((val, index, array) => {
      const employee = reversed ? array[array.length - index - 1] : val
      return {
        node: employee,
        cursor: employee["name"],
      };
    }),
    pageInfo: {
      endCursor:
        employees.length > 0 ? employees[reversed ? 0 : employees.length - 1]["name"] : "",
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
