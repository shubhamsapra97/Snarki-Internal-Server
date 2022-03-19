const { gql } = require('apollo-server-express');

const typeDefs = gql`
    enum Role {
        RESTAURANT
    }

    type Status {
        code: Int,
        message: String!
    }

    type Login {
        code: Int!,
        message: String!
        token: String
        meData: User
    }

    type User {
        email: String!
        verified: Boolean!
        role: String!
    }

    type UserData {
        meData: User
        code: Int!,
        message: String!
    }

    type Location {
        type: String,
        coordinates: [Float!]!
    }

    type Restaurant {
        _id: String!
        name: String!
        address: String!
        city: String!
        state: String!
        postalCode: String!
        contact: String!
        hours: String!
        cuisines: [String!]!
        location: Location!
    }

    type RestaurantResult {
        code: Int!
        message: String!
        restaurants: [Restaurant]
    }

    type Query {
        login(
            email: String!
            password: String!
        ): Login

        contact(
            email: String!
            firstName: String
            lastName: String
            comments: String!
        ): Status

        me: UserData
    }

    type Mutation {
        register(
            email: String!,
            role: String!,
            password: String!
        ): Status
    }
`;

module.exports = typeDefs;