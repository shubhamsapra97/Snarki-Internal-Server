const {ObjectId} = require('mongodb');
const {getDb} = require("../utils/mongo");

const findUser = async (args) => {
    return await getDb().collection("users").findOne({...args});
}

const addUser = async args => {
    await getDb().collection("users").insertOne({...args});
}

const getClaimRequests = async () => {
    return await getDb().collection("claim_restaurant_verification")
        .aggregate([
            {
                $match: { status: "unclaimed" }
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurant"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ]).toArray();
}

const getClaimRequest = async (requestId) => {
    return await getDb().collection("claim_restaurant_verification")
        .aggregate([
            {   
                $match: { 
                    _id: ObjectId(requestId),
                    status: "unclaimed"
                }
            },
            {
                $lookup: {
                    from: "restaurants",
                    localField: "restaurantId",
                    foreignField: "_id",
                    as: "restaurant"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            }
        ]).toArray();
}

const findRequest = async ({type, requestId, status}) => {
    const collection = type === "claim" ? "claim_restaurant_verification" : "register_restaurant_verification";
    return await getDb().collection(collection)
        .findOne({
            status,
            _id: ObjectId(requestId)
        });
}

const updateRestaurant = async (restaurantId, udpatedData) => {
    return await getDb().collection("restaurants")
        .updateOne(
            { _id: ObjectId(restaurantId) },
            {
                $set: { ...udpatedData }
            }
        );
}

const createDocumentRecord = async args => {
    await getDb().collection("restaurant_documents").insertOne({...args});
}

const updateRequestStatus = async ({requestId, status, type, ...rest}) => {
    const collection = type === "claim" ? "claim_restaurant_verification" : "register_restaurant_verification";
    return await getDb().collection(collection)
        .updateOne(
            { _id: ObjectId(requestId) },
            {
                $set: { status, ...rest }
            }
        );
}

const findRestaurantStatus = async ({restaurantId, claimed}) => {
    return await getDb().collection("restaurants").findOne({
        _id: ObjectId(restaurantId),
        claimed
    });
}

module.exports = {
    findUser,
    addUser,
    getClaimRequests,
    getClaimRequest,
    findRequest,
    updateRestaurant,
    createDocumentRecord,
    updateRequestStatus,
    findRestaurantStatus
};
