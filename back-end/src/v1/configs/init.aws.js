import AWS from 'aws-sdk';

export default function() {
  // Cấu hình AWS credentials
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  
  // Khởi tạo S3 client
  const s3 = new AWS.S3();
  
  return {
    s3,
    bucketName: process.env.S3_BUCKET_NAME,
    cloudFrontDomain: process.env.CLOUDFRONT_DOMAIN
  };
}