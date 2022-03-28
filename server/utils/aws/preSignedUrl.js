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

module.exports = {
    getPresignedUrl
};
