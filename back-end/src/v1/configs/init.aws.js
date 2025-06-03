import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

let s3Client;
let bucketName;
let cloudFrontDomain;

function initAWS() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    bucketName = process.env.S3_BUCKET_NAME;
    cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
  }

  return {
    s3Client,
    bucketName,
    cloudFrontDomain,
    Upload
  };
}

export default initAWS;
