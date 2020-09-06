import { GraphQLServer } from "graphql-yoga";
import { makeDatabase } from "./db/make-database";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./db/employee-crud";
import postgres from "postgres";

// TODO: should id: String be id: ID?
const typeDefs = `
  type Query {
    employees(filter: FilterInput, first: Int, after: String): EmployeePage!
  }

  input FilterInput {
    name: String
    title: String
    email: String
    department: String
  }

  type Employee {
    id: String
    name: String!
    email: String!
    dob: String!
    phone: String!
    picture_thumbnail: String!
    department: String!
    title: String! 
  }

  type EmployeePage {
    totalCount: Int!
    edges: [EmployeeEdge!]!
    pageInfo: EmployeePageInfo!
  }

  type EmployeeEdge {
    node: Employee!
    cursor: String!
  }

  type EmployeePageInfo {
    endCursor: String!
  }

  type Mutation {
    createEmployee(input: CreateEmployeeInput!): Employee!
    updateEmployee(input: UpdateEmployeeInput!): Employee!
    deleteEmployee(input: DeleteEmployeeInput!): DeleteEmployeeOutput!
  }

  input CreateEmployeeInput {
    name: String!
    email: String!
    dob: String!
    phone: String!
    picture_thumbnail: String!
    department: String!
    title: String! 
  }

  input UpdateEmployeeInput {
    id: String!
    name: String!
    email: String!
    dob: String!
    phone: String!
    picture_thumbnail: String!
    department: String!
    title: String! 
  }

  input DeleteEmployeeInput {
    id: String!
  }

  type DeleteEmployeeOutput {
    count: Int!
  }
`;

const sql = postgres();

const resolvers = {
  Query: {
    employees: (_, { filter, first, after }) =>
      getEmployees(sql, filter, first, after),
  },
  Mutation: {
    createEmployee: (_, { input }) => createEmployee(sql, input),
    updateEmployee: (_, { input }) => updateEmployee(sql, input),
    deleteEmployee: (_, { input }) => deleteEmployee(sql, input),
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));

server.express.get("/make-database", async (req, res) => {
  try {
    await makeDatabase(500);
    res.send("Done!");
  } catch (e) {
    res.send(e);
  }
});
