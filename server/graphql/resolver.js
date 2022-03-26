const _ = require("lodash");
const {ObjectId} = require('mongodb');
const jwt = require('jsonwebtoken');
const {
    findUser,
    addUser,
    getClaimRequest,
    getClaimRequests,
    findRequest,
    updateRestaurant,
    createDocumentRecord,
    updateRequestStatus,
    findRestaurantStatus
} = require("../data/data");
const constants = require("../utils/constants");
const {hashPassword, comparePassword} = require("../utils/bcrypt");
const {getPresignedUrl} = require("../utils/aws/preSignedUrl");

const registerUser = async data => {
    const {email, password, role} = data;

    if (!email || !password || !role) {
        return {
            code: 400,
            message: "missing arguments"
        }
    }

    if (role != "ADMIN") {
        return {
            code: 401,
            message: "Invalid Role"
        };
    }

    const emailValidation = constants.emailRegex.test(email);
    const passwordValidation = constants.passwordRegex.test(password);
    if (!emailValidation || !passwordValidation) {
        return {
            code: 400,
            message: "Validation Failed"
        };
    }

    try {
        const userDetails = await findUser({email});
        if (userDetails) {
            return {
                code: 409,
                message: "User with same email already exists!"
            };
        }

        let securePassword;
        try {
            securePassword = await hashPassword(password);
        } catch(err) {
            throw new Error(err);
        }

        await addUser({
            role,
            email: email.toLowerCase(),
            password: securePassword,
            verified: false
        });

        return {
            code: 201,
            message: "User created successfully!",
        };

    } catch(err) {
        return {
            code: 500,
            message: "Something went wrong!",
        };
    }
};

const loginUser = async (data) => {
    const {email, password} = data;

    if (!email || !password) {
        return {
            code: 400,
            message: "missing arguments"
        }
    }

    const emailValidation = constants.emailRegex.test(email);
    const passwordValidation = constants.passwordRegex.test(password);
    if (!emailValidation || !passwordValidation) {
        return {
            code: 400,
            message: "Validation Failed"
        };
    }

    try {
        const userDetails = await findUser({email: email.toLowerCase()});
        if (!userDetails) {
            return {
                code: 404,
                message: "No user found"
            };
        }

        if(userDetails.role !== "ADMIN") {
            return {
                code: 400,
                message: "Login with Admin Credentails"
            };
        }

        let passwordMatch;
        try {
            passwordMatch = await comparePassword(password, userDetails.password);
        } catch(err) {
            throw new Error(err);
        }

        if (!passwordMatch) {
            return {
                code: 400,
                message: "Wrong Credentials"
            };
        }

        const authToken = jwt.sign({
            data: {
                email,
                userId: userDetails._id,
                role: userDetails.role
            }
        }, constants.TOKEN_SECRET, { expiresIn: 60*30 });

        delete userDetails.password;
        return {
            code: 200,
            token: authToken,
            meData: {...userDetails},
            message: "Authentication successfull",
        };

    } catch(err) {
        return {
            code: 500,
            message: "Something went wrong!",
        };
    }
};

const me = async user => {
    if (!user) {
        return {
            code: 401,
            message: "Unauthorised"
        }
    }

    try {
        const userDetails = await findUser({email: user.email});
        if (!userDetails) {
            return {
                code: 400,
                message: "User not found!"
            };
        }

        delete userDetails.password;
        return {
            code: 200,
            meData: {...userDetails},
            message: "User details fetched successfully",
        };

    } catch(err) {
        return {
            code: 500,
            message: "Something went wrong!",
        };
    }
};

const getRestaurantRequests = async user => {
    if (!user || user.role !== "ADMIN") {
        return {
            code: 401,
            message: "Unauthorised"
        }
    }

    try {
        let requests = await getClaimRequests();
        const response = [];

        for(let i=0; i<requests.length; i++) {
            const userData = { ...requests[i].user[0] };
            delete userData.password;
            delete userData._id;

            response.push({
                _id: requests[i]._id,
                user: userData,
                restaurant: {...requests[i].restaurant[0]},
                documents: requests[i].documents,
            });
        }

        return {
            code: 200,
            message: "Claim Requests fetched successfully",
            requests: response
        }
    } catch(err) {
        console.log(err);
        return {
            code: 500,
            message: "Something went wrong!",
        };
    }
};

const getRestaurantClaimRequest = async (args, user) => {
    if (!user || user.role !== "ADMIN") {
        return {
            code: 401,
            message: "Unauthorised"
        }
    }

    if (!args._id) {
        return {
            code: 400,
            message: "Request Id missing!"
        }
    }

    try {
        let requests = await getClaimRequest(args._id);
        const response = [];
        
        if (requests.length) {
            const userData = { ...requests[0].user[0] };
            delete userData.password;
            delete userData._id;

            response.push({
                _id: requests[0]._id,
                user: userData,
                restaurant: {...requests[0].restaurant[0]},
                documents: requests[0].documents,
            });

            return {
                code: 200,
                message: "Claim Requests fetched successfully",
                requests: response
            }
        }

        return {
            code: 200,
            message: "Request not found!",
            requests: response
        }
    } catch(err) {
        return {
            code: 500,
            message: "Something went wrong!",
        };
    }
};

const getRestaurantDocuments = async (args, user) => {
    if (!user) {
        return {
            code: 401,
            message: "Unauthorised"
        };
    }

    if (!args._id || !args.type) {
        return {
            code: 400,
            message: "Invalid request or type."
        }
    }

    const searchArgs = {};
    searchArgs["requestId"] = args._id;
    searchArgs["type"] = args.type;
    if (args.type === "claim") {
        searchArgs["status"] = "unclaimed";
    } else if (args.type === "register") {
        searchArgs["status"] = "unregistered";
    }

    let request;
    try {
        request = await findRequest(searchArgs);
        if (!request) {
            return {
                code: 400,
                message: "Request not found!"
            };
        }
    } catch(err) {
        throw new Error(err);
    }

    const documentUrls = [];
    for(let i=0; i<request.documents.length; i++) {
        documentUrls.push(getPresignedUrl(request.documents[i]));
    }
    return {
        code: 200,
        documentUrls,
        message: "Document Urls fetched Successfully",
    }
}

const updateClaimRequestStatus = async (args, user) => {
    if (!user) {
        return {
            code: 401,
            message: "Unauthorised"
        };
    }

    const {status, _id} = args;
    if (!status || !_id) {
        return {
            code: 400,
            message: "Request Id missing!"
        }
    }

    const searchArgs = {};
    searchArgs["requestId"] = _id;
    searchArgs["status"] = "unclaimed";
    searchArgs["type"] = "claim";

    let request;
    try {
        request = await findRequest(searchArgs);
        if (!request) {
            return {
                code: 400,
                message: "Request not found!"
            };
        }
    } catch(err) {
        throw new Error(err);
    }

    if (status === "approved") {

        try {
            let isRestaurantClaimed = await findRestaurantStatus({
                restaurantId: request.restaurantId,
                claimed: true
            });
            if (isRestaurantClaimed) {
                return {
                    code: 400,
                    message: "Restaurant already claimed!"
                };
            }
        } catch(err) {
            throw new Error(err);
        }

        try {
            await updateRestaurant(request.restaurantId, {
                userId: request.userId,
                claimed: true
            });
        } catch(err) {
            throw new Error(err);
        }

        try {
            await createDocumentRecord({
                documents: request.documents,
                restaurantId: request.restaurantId
            });
        } catch(err) {
            throw new Error(err);
        }

        try {

            await updateRequestStatus({
                status: "claimed",
                requestId: _id,
                type: "claim",
                adminId: user.userId
            });

        } catch(err) {
            throw new Error(err);
        }

    } else if (status === "rejected") {

        try {
            await updateRequestStatus({
                status,
                requestId: _id,
                type: "claim",
                adminId: user.userId
            });
        } catch(err) {
            throw new Error(err);
        }

    }

    return {
        code: 200,
        message: "Claim Request Status Updated Successfully"
    }
}

module.exports = {
    loginUser,
    registerUser,
    me,
    getRestaurantRequests,
    getRestaurantClaimRequest,
    getRestaurantDocuments,
    updateClaimRequestStatus
}
