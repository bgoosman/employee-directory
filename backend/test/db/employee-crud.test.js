import sinon from "sinon";
import { expect } from "chai";

import {
  getStringFilter,
  getEmployees,
  createEmployee,
} from "../../src/db/employee-crud.js";

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

describe("createEmployee", () => {
  let input;

  beforeEach(() => {
    input = {
      name: "NAME",
      email: "EMAIL",
      dob: "DOB",
      phone: "PHONE",
      picture_thumbnail: "PICTURE_THUMBNAIL",
      department: "DEPARTMENT",
      title: "TITLE",
    };
  });

  it("returns an employee with a unique id", () => {
    const sql = sinon.spy();
    const output = createEmployee(sql, input);
    expect(output["id"]).to.not.be.null;
  });

  it("uses all the input args", () => {
    const sql = sinon.spy();
    createEmployee(sql, input);
    const queryInsertArgs = sql.args[0][0];
    Object.keys(input).forEach((key) => {
      expect(queryInsertArgs[key]).to.equal(input[key]);
    });
  });
});
