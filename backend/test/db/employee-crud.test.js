import sinon from "sinon";
import { expect } from "chai";

import { getStringFilter, getEmployees } from "../../src/db/employee-crud.js";

describe("getStringFilter", () => {
  it("should return a valid prefix search sql", () => {
    const actual = getStringFilter("name", "Be");
    const expected = "and name like 'Be%'";
    expect(actual).to.equal(expected);
  });
});

describe("getEmployees", () => {
  it("uses all the filters", () => {
    const filters = {
      name: "Me",
      email: "em",
      title: "Aa",
      department: "Sa",
    };
    const sql = {
      unsafe: sinon.spy(),
    };
    const nameFilter = getStringFilter("name", filters["name"]);
    const emailFilter = getStringFilter("email", filters["email"]);
    const titleFilter = getStringFilter("title", filters["title"]);
    const departmentFilter = getStringFilter(
      "department",
      filters["department"]
    );
    getEmployees(sql, filters);
    const query = sql.unsafe.args[0][0];
    expect(query).to.not.be.null;
    expect(query).to.have.string(nameFilter);
    expect(query).to.have.string(emailFilter);
    expect(query).to.have.string(titleFilter);
    expect(query).to.have.string(departmentFilter);
  });
});
