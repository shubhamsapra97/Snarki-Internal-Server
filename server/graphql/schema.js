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
        claimed: String!
        images: [String!]
    }

    type RequestType {
        _id: String!
        user: User!
        restaurant: Restaurant!
        documents: [String!]
    }

    type RequestsResponse {
        code: Int!
        message: String!
        requests: [RequestType!]
    }

    type RequestDocumentType {
        code: Int!
        message: String!
        documentUrls: [String!]
    }

    type Query {
        login(
            email: String!
            password: String!
        ): Login

        me: UserData

        getClaimRequests: RequestsResponse
        getClaimRequest(
            _id: String!
        ): RequestsResponse

        getDocuments(
            _id: String!
            type: String!
        ): RequestDocumentType

    }

    type Mutation {
        register(
            email: String!,
            role: String!,
            password: String!
        ): Status

        claimRequestUpdate(
            _id: String!,
            status: String!
        ): Status
    }
`;

module.exports = typeDefs;