const { ApolloServer, ApolloError, gql } = require("apollo-server");
const axios = require("axios");
const uuid = require("uuid");

const typeDefs = gql`
  type Query {
    index(id: ID!): Index
    search: [String]!
  }

  input indexEntryBody {
    id: ID!
    contentType: String!
    rendered: String
    tags: [String!]!
    createdAt: String!
    image: String!
    crops: [String!]
    source: String!
    license: String!
    altText: String!
  }

  input updateBody {
    contentType: String!
    rendered: String
    tags: [String]
    altText: String
  }

  input searchEntryBody {
    query: String!
  }

  type Mutation {
    createIndexEntry(input: indexEntryBody!): Index
    createSearchEntry(input: searchEntryBody!): SearchQuery
    updateIndexEntry(id: ID!, input: updateBody!): Index
    removeIndexEntry(id: ID!): Index
  }

  type Index {
    id: ID!
    contentType: String!
    rendered: String!
    tags: [String]!
    createdAt: String!
    indexedAt: String!
    source: String!
    license: String!
    altText: String!
    image: String!
    crops: [String!]!
  }

  type Search {
    query: String!
    contentType: String!
    timeAfter: String!
    timeBefore: String!
  }

  type SearchQuery {
    searchTimeMsecs: Int!
    results: [Index]!
    query: Search
  }
`;

const resolvers = {
  Query: {
    index: (parent, { id }) => {
      try {
        return axios
          .get(`http://localhost:3000/index/${id}`)
          .then(res => res.data);
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    search: (parent, args, context, info) => {
      try {
        return axios.get(`http://localhost:3000/search/`).then(res => res.data);
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  Mutation: {
    createIndexEntry: async (parent, { input }) => {
      try {
        const index = await axios
          .post("http://localhost:3000/index/", { ...input, id: uuid.v4() })
          .then(res => res.data);
        return index;
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    updateIndexEntry: async (parent, { id, input }) => {
      try {
        const index = await axios
          .patch(`http://localhost:3000/index/${id}`, { ...input })
          .then(res => res.data);
        return index;
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    removeIndexEntry: async (parent, { id }) => {
      try {
        const index = await axios
          .delete(`http://localhost:3000/index/${id}`)
          .then(res => console.log("successfully deleted"));
        return index;
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    createSearchEntry: async (parent, { input }) => {
      try {
        const queryResponse = await axios
          .post("http://localhost:3000/search/", { ...input })
          .then(res => res.data);
        return queryResponse;
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
