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

    type RegisterRestaurant {
        name: String!
        address: String!
        city: String!
        state: String!
        postalCode: String!
        contact: String!
        hours: String!
        cuisines: [String!]!
        location: Location!
        images: [String!]
    }

    type RequestType {
        _id: String!
        user: User!
        restaurant: Restaurant!
        documents: [String!]
    }

    type RegisterRequestType {
        _id: String!
        user: User!
        restaurant: RegisterRestaurant!
        documents: [String!]
        images: [String!]
        status: String!
    }

    type RequestsResponse {
        code: Int!
        message: String!
        requests: [RequestType!]
    }

    type RegisterRequestsResponse {
        code: Int!
        message: String!
        requests: [RegisterRequestType!]
    }

    type RequestDocumentType {
        code: Int!
        message: String!
        documentUrls: [String!]
        imageUrls: [String!]
    }

    type RestaurantsResponse {
        code: Int!
        message: String!
        restaurants: [Restaurant!]
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

        getRegisterRequests: RegisterRequestsResponse
        getRegisterRequest(
            _id: String!
        ): RegisterRequestsResponse

        getSimilarRestaurants(
            _id: String!
        ): RestaurantsResponse

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
            reason: String!
        ): Status

        addRequestUpdate(
            _id: String!,
            status: String!
            reason: String!
        ): Status
    }
`;

module.exports = typeDefs;