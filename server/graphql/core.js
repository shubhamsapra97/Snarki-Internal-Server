const typeDefs = require("./schema");
const {
    registerUser,
    loginUser,
    me,
    getRestaurantRequests,
    getRestaurantClaimRequest,
    getRestaurantDocuments,
    updateClaimRequestStatus
} = require("./resolver");

const resolvers = {
    Query: {
        login: (_, args, {res}) => loginUser(args, res),
        me: (_, args, {user}) => me(user),
        getClaimRequests: (_, args, {user}) => getRestaurantRequests(user),
        getClaimRequest: (_, args, {user}) => getRestaurantClaimRequest(args, user),
        getDocuments: (_, args, {user}) => getRestaurantDocuments(args, user)
    },
    Mutation: {
        register: (_, args) => registerUser(args),
        claimRequestUpdate: (_, args, {user}) => updateClaimRequestStatus(args, user)
    }
};

const apolloData = {typeDefs, resolvers};

module.exports = {apolloData};
