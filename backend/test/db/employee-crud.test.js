import sinon from "sinon";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import {
  defaultLimit,
  getStringFilter,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../src/db/employee-crud.js";
import { employees } from "../fixtures/employee.js";

describe("getStringFilter", () => {
  it("should return a valid prefix search sql", () => {
    const actual = getStringFilter("name", "Be");
    const expected = "and name like 'Be%'";
    expect(actual).to.equal(expected);
  });
});

function makeUnsafeSqlStub(count) {
  if (!count) count = defaultLimit;
  const stub = sinon.stub();
  const slice = employees.slice(0, count);
  stub.onCall(0).returns([{ count }]);
  stub.onCall(1).returns(slice);
  return {
    unsafe: stub,
  };
}

describe("getEmployees", () => {
  it("uses all the filters", async () => {
    const filters = {
      name: "Me",
      email: "em",
      title: "Aa",
      department: "Sa",
    };
    const sql = makeUnsafeSqlStub();
    await getEmployees(sql, filters);
    const query = sql.unsafe.args[0][0];
    expect(query).to.not.be.null;
    expect(query).to.have.string(getStringFilter("name", filters["name"]));
    expect(query).to.have.string(getStringFilter("email", filters["email"]));
    expect(query).to.have.string(getStringFilter("title", filters["title"]));
    expect(query).to.have.string(
      getStringFilter("department", filters["department"])
    );
  });

  it("applies a default limit", async () => {
    const sql = makeUnsafeSqlStub();
    await getEmployees(sql, {});
    const query = sql.unsafe.args[1][0];
    expect(query).to.have.string(`limit ${defaultLimit}`);
  });

  it("uses first after", async () => {
    const first = 5;
    const after = "AFTER";
    const sql = makeUnsafeSqlStub(first);
    await getEmployees(sql, {}, first, after, undefined, undefined);
    const query = sql.unsafe.args[1][0];
    expect(query).to.have.string(`limit ${first}`);
    expect(query).to.have.string(`and name > '${after}'`);
    expect(query).to.have.string(`order by name asc`);
  });

  it("uses last before", async () => {
    const last = 5;
    const before = "BEFORE";
    const sql = makeUnsafeSqlStub(last);
    await getEmployees(sql, {}, undefined, undefined, last, before);
    const query = sql.unsafe.args[1][0];
    expect(query).to.have.string(`limit ${last}`);
    expect(query).to.have.string(`order by name desc`);
  });

  it("returns a page of employees", async () => {
    const sql = makeUnsafeSqlStub(defaultLimit);
    const page = await getEmployees(sql, {});
    expect(page["totalCount"]).to.equal(defaultLimit);
    expect(page["edges"].length).to.equal(defaultLimit);
    const lastEdge = page["edges"][page["edges"].length - 1];
    const endCursor = page["pageInfo"]["endCursor"];
    expect(lastEdge["cursor"]).to.equal(endCursor);
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
