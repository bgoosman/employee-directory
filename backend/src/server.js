import { GraphQLServer } from "graphql-yoga";
import { makeDatabase } from "./db/make-database";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
} from "./db/employee-crud";
import postgres from "postgres";

const typeDefs = `
  type Query {
    employees(filter: FilterInput): [Employee!]!
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

  type Mutation {
    createEmployee(input: CreateEmployeeInput!): Employee!
    updateEmployee(input: UpdateEmployeeInput!): Employee!
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
`;

const sql = postgres();

const resolvers = {
  Query: {
    employees: (_, { filter }) => getEmployees(sql, filter),
  },
  Mutation: {
    createEmployee: (_, { input }) => createEmployee(sql, input),
    updateEmployee: (_, { input }) => updateEmployee(sql, input),
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
