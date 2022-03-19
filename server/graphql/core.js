const typeDefs = require("./schema");
// const {} = require("./resolver");

const resolvers = {
    Query: {
        contact: (_, args) => ({})
    },
    Mutation: {
        register: (_, args) => ({})
    }
};

const apolloData = {typeDefs, resolvers};

module.exports = {apolloData};