const typeDefs = require("./schema");
const {
    registerUser,
    loginUser,
    me,
    getRestaurantClaimRequests,
    getRestaurantClaimRequest,
    getRestaurantDocuments,
    updateClaimRequestStatus,
    getRestaurantRegisterRequests,
    getRestaurantRegisterRequest,
    getSimilarRestaurant,
    updateAddRequestStatus
} = require("./resolver");

const resolvers = {
    Query: {
        login: (_, args, {res}) => loginUser(args, res),
        me: (_, args, {user}) => me(user),
        getClaimRequests: (_, args, {user}) => getRestaurantClaimRequests(user),
        getClaimRequest: (_, args, {user}) => getRestaurantClaimRequest(args, user),
        getDocuments: (_, args, {user}) => getRestaurantDocuments(args, user),
        getRegisterRequests: (_, args, {user}) => getRestaurantRegisterRequests(user),
        getRegisterRequest: (_, args, {user}) => getRestaurantRegisterRequest(args, user),
        getSimilarRestaurants: (_, args, {user}) => getSimilarRestaurant(args, user),
    },
    Mutation: {
        register: (_, args) => registerUser(args),
        claimRequestUpdate: (_, args, {user}) => updateClaimRequestStatus(args, user),
        addRequestUpdate: (_, args, {user}) => updateAddRequestStatus(args, user)
    }
};

const apolloData = {typeDefs, resolvers};

module.exports = {apolloData};
