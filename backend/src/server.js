import { GraphQLServer } from "graphql-yoga";
import { makeDatabase } from "./make-database";

const typeDefs = `
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || "World"}`,
  },
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));

server.express.get("/make-database", async (req, res) => {
  try {
    await makeDatabase(5);
    res.send("Done!");
  } catch (e) {
    res.send(e);
  }
});
