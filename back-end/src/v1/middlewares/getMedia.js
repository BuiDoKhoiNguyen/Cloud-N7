import fs from 'fs';
import path from 'path';
import File from '../models/File.js';
import AWS from 'aws-sdk';
import { fileURLToPath } from 'url';
import initAWS from '../configs/init.aws.js';
import { createImageVersions } from '../utils/imageProcessor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { s3, bucketName, cloudFrontDomain } = initAWS();

export default async function (req, res, next) {
  try {
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', '..', 'uploads', req.file.filename);
      const timestamp = Date.now();
      const sanitizedFileName = req.file.originalname.replace(/\s+/g, '-');
      const fileKey = `uploads/${timestamp}-${sanitizedFileName}`;
      
      // Tạo các phiên bản ảnh khác nhau nếu là image
      const { originalPath, versions } = await createImageVersions(filePath, req.file.mimetype);
      
      // Upload file gốc lên S3
      const fileContent = fs.readFileSync(originalPath);
      const params = {
        Bucket: bucketName,
        Key: fileKey,
        Body: fileContent,
        ContentType: req.file.mimetype
      };
      
      // Upload file gốc lên S3
      await s3.upload(params).promise();
      
      // Tạo CloudFront URL cho file gốc
      const fileUrl = `${cloudFrontDomain}/${fileKey}`;
      
      // Khởi tạo transformations với URL gốc
      const transformations = {
        original: fileUrl
      };
      
      // Upload các phiên bản và lưu URLs
      for (const [version, versionInfo] of Object.entries(versions)) {
        const versionContent = fs.readFileSync(versionInfo.path);
        
        await s3.upload({
          Bucket: bucketName,
          Key: versionInfo.key,
          Body: versionContent,
          ContentType: versionInfo.mimetype
        }).promise();
        
        transformations[version] = `${cloudFrontDomain}/${versionInfo.key}`;
        
        // Xóa file phiên bản tạm
        fs.unlinkSync(versionInfo.path);
      }
      
      // Tạo bản ghi file trong database
      const file = await File.create({
        url: fileUrl,
        s3Key: fileKey,
        type: req.file.mimetype,
        name: req.file.originalname,
        transformations
      });
      
      req.body[req.file.fieldname] = file._id.toString();
      fs.unlink(filePath, err => { });
    } else if (req.files?.length) {
      req.body[req.files[0].fieldname] = await Promise.all(req.files.map(async e => {
        const filePath = path.join(__dirname, '..', '..', '..', 'uploads', e.filename);
        const timestamp = Date.now();
        const sanitizedFileName = e.originalname.replace(/\s+/g, '-');
        const fileKey = `uploads/${timestamp}-${sanitizedFileName}`;
        
        // Tạo các phiên bản ảnh khác nhau nếu là image
        const { originalPath, versions } = await createImageVersions(filePath, e.mimetype);
        
        // Upload file gốc lên S3
        const fileContent = fs.readFileSync(originalPath);
        const params = {
          Bucket: bucketName,
          Key: fileKey,
          Body: fileContent,
          ContentType: e.mimetype
        };
        
        // Upload file gốc lên S3
        await s3.upload(params).promise();
        
        // Tạo CloudFront URL cho file gốc
        const fileUrl = `${cloudFrontDomain}/${fileKey}`;
        
        // Khởi tạo transformations với URL gốc
        const transformations = {
          original: fileUrl
        };
        
        // Upload các phiên bản và lưu URLs
        for (const [version, versionInfo] of Object.entries(versions)) {
          const versionContent = fs.readFileSync(versionInfo.path);
          
          await s3.upload({
            Bucket: bucketName,
            Key: versionInfo.key,
            Body: versionContent,
            ContentType: versionInfo.mimetype
          }).promise();
          
          transformations[version] = `${cloudFrontDomain}/${versionInfo.key}`;
          
          // Xóa file phiên bản tạm
          fs.unlinkSync(versionInfo.path);
        }
        
        // Tạo bản ghi file trong database
        const file = await File.create({
          url: fileUrl,
          s3Key: fileKey,
          type: e.mimetype,
          name: e.originalname,
          transformations
        });
        
        fs.unlink(filePath, err => { });
        return file._id.toString();
      }));
    }
  } catch (err) {
    next(err);
  }

  next();
}