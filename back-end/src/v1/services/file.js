import File from '../models/File.js';
import Redis from '../configs/init.redis.js';
import initAWS from '../configs/init.aws.js';

const { s3, bucketName, cloudFrontDomain } = initAWS();

class Service {
  getById = async id => {
    const cache = await Redis.client.get('file:' + id);
    if (cache) return JSON.parse(cache);
    const val = (await File.findById(id)).toObject();
    Redis.client.set('file:' + id, JSON.stringify(val));
    return val;
  }

  deleteById = async id => {
    const file = await File.findById(id);
    if (file._system) return;
    
    try {
      // Xóa file gốc từ S3
      if (file.s3Key) {
        const params = {
          Bucket: bucketName,
          Key: file.s3Key
        };
        
        await s3.deleteObject(params).promise();
        console.log(`Deleted original file: ${file.s3Key}`);
      }
      
      // Xóa các phiên bản của ảnh nếu có
      if (file.transformations) {
        // Xóa thumbnail
        if (file.transformations.thumbnail) {
          const thumbnailKey = file.transformations.thumbnail.replace(`${cloudFrontDomain}/`, '');
          await s3.deleteObject({
            Bucket: bucketName,
            Key: thumbnailKey
          }).promise();
          console.log(`Deleted thumbnail: ${thumbnailKey}`);
        }
        
        // Xóa small
        if (file.transformations.small) {
          const smallKey = file.transformations.small.replace(`${cloudFrontDomain}/`, '');
          await s3.deleteObject({
            Bucket: bucketName,
            Key: smallKey
          }).promise();
          console.log(`Deleted small version: ${smallKey}`);
        }
        
        // Xóa medium
        if (file.transformations.medium) {
          const mediumKey = file.transformations.medium.replace(`${cloudFrontDomain}/`, '');
          await s3.deleteObject({
            Bucket: bucketName,
            Key: mediumKey
          }).promise();
          console.log(`Deleted medium version: ${mediumKey}`);
        }
        
        // Xóa large
        if (file.transformations.large) {
          const largeKey = file.transformations.large.replace(`${cloudFrontDomain}/`, '');
          await s3.deleteObject({
            Bucket: bucketName,
            Key: largeKey
          }).promise();
          console.log(`Deleted large version: ${largeKey}`);
        }
      }
    } catch (error) {
      console.error(`Error deleting file ${id}:`, error);
    }
    
    Redis.client.del('file:' + id);
    return file.deleteOne();
  }
}

export default new Service();