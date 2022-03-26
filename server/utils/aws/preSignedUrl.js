const { getAwsInstance } = require('../aws/aws');

const AWS = getAwsInstance('S3');
let s3 = new AWS.S3({
    region: 'us-east-1',
    signatureVersion: 'v4'
});

const getPresignedUrl = (key) => {
    try {
        const params = {
            Bucket: 'snarki-verification-documents',
            Key: key,
            Expires: 900
        };
        return new Promise((resolve,reject) => {
            s3.getSignedUrl('getObject', params, (err, url) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(url); 
            });
        });
    } catch(err) {
        throw new Error(err);
    }
}

const putPresignedUrl = async ({category = "newRestaurants"}) => {
    let conditionMatch = "eq";
    let defaultType = "application/pdf";

    if (category === "images") {
        conditionMatch = "starts-with",
        defaultType = "image/"
    }

    const params = {
        Bucket: 'snarki-verification-documents',
        Conditions: [
            ['content-length-range', '100', '5000000'],
            [conditionMatch, "$Content-Type", defaultType]
        ],
        Fields: {
            key: `${category}/${uuidv4()}`,
        },
        Expires: 60*5
    };
    try {
        // const response = await s3.createPresignedPost(params);
        // return JSON.stringify(response);
        return new Promise(async (resolve, reject) => {
            s3.createPresignedPost(params, (err, data) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(JSON.stringify(data));
            });
        });
    } catch(err) {
        throw new Error(err);
    }
}

module.exports = {
    putPresignedUrl,
    getPresignedUrl
};
