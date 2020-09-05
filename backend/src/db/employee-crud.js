const postgres = require("postgres");

export async function getEmployees() {
  const sql = postgres();
  const employees = await sql`
    SELECT * FROM employees
  `;
  return employees;
}
