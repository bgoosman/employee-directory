function getStringFilter(fieldName, searchPrefix) {
  return searchPrefix ? `and ${fieldName} like '${searchPrefix}%'` : "";
}

async function getEmployees(sql, filter) {
  const andName = getStringFilter("name", filter["name"]);
  const andEmail = getStringFilter("email", filter["email"]);
  const andTitle = getStringFilter("title", filter["title"]);
  const andDepartment = getStringFilter("department", filter["department"]);
  // in production, I would find a different library that supported
  // dynamic where clauses and template literals, but at this point
  // it didn't feel worth switching libraries
  const employees = await sql.unsafe(`
    select * from employees
    where 1=1 ${andName} ${andEmail} ${andTitle} ${andDepartment}
  `);
  return employees;
}

export { getStringFilter, getEmployees };
