import sinon from "sinon";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import {
  getStringFilter,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
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

  it("returns an employee with a unique id", async () => {
    const sql = sinon.spy();
    const output = await createEmployee(sql, input);
    expect(output["id"]).to.not.be.null;
  });

  it("uses all the input args", async () => {
    const sql = sinon.spy();
    await createEmployee(sql, input);
    const queryInsertArgs = sql.args[0][0];
    Object.keys(input).forEach((key) => {
      expect(queryInsertArgs[key]).to.equal(input[key]);
    });
  });
});

describe("updateEmployee", () => {
  let input;

  beforeEach(() => {
    input = {
      id: "ID",
      name: "NAME",
      email: "EMAIL",
      dob: "DOB",
      phone: "PHONE",
      picture_thumbnail: "PICTURE_THUMBNAIL",
      department: "DEPARTMENT",
      title: "TITLE",
    };
  });

  it("returns the employee", async () => {
    const sql = sinon.fake.returns({
      count: 1,
    });
    const output = await updateEmployee(sql, input);
    expect(output).to.equal(input);
  });

  it("updates all the input args except the primary key", async () => {
    const sql = sinon.fake.returns({
      count: 1,
    });
    await updateEmployee(sql, input);
    const queryUpdateArgs = sql.args[0][0];
    expect(queryUpdateArgs).to.not.have.keys("id");
    Object.keys(input).forEach((key) => {
      if (key !== "id") {
        expect(queryUpdateArgs[key]).to.equal(input[key]);
      }
    });
  });

  it("throws an error if no update occurred", async () => {
    const sql = sinon.fake.returns({
      count: 0,
    });
    await expect(updateEmployee(sql, input)).to.be.rejectedWith(Error);
  });
});

describe("deleteEmployee", () => {
  let input;

  beforeEach(() => {
    input = {
      id: "ID",
    };
  });

  it("returns the count of employees deleted", async () => {
    const expectedCount = 1;
    const sql = sinon.fake.returns({
      count: expectedCount,
    });
    const result = await deleteEmployee(sql, input);
    expect(result.count).to.equal(expectedCount);
  });

  it("uses the input id", async () => {
    const sql = sinon.fake.returns({
      count: 1,
    });
    await deleteEmployee(sql, input);
    const deletedId = sql.args[0][1];
    expect(deletedId).to.equal(input["id"]);
  });
});
