import fs from 'fs';
import path from 'path';
import File from '../models/File.js';
import { fileURLToPath } from 'url';
import initAWS from '../configs/init.aws.js';
import { createImageVersions } from '../utils/imageProcessor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function (req, res, next) {
  try {
    const { s3Client, bucketName, cloudFrontDomain, Upload } = initAWS();
    
    if (req.file) {
      const filePath = path.join(__dirname, '..', '..', '..', 'uploads', req.file.filename);
      const timestamp = Date.now();
      const sanitizedFileName = req.file.originalname.replace(/\s+/g, '-');
      const fileKey = `uploads/${timestamp}-${sanitizedFileName}`;
      
      // Tạo các phiên bản ảnh khác nhau nếu là image
      const { originalPath, versions } = await createImageVersions(filePath, req.file.mimetype);
      
      let fileUrl;
      let transformations = {};
      
      try {
        // Upload file gốc lên S3 using v3 SDK
        const fileContent = fs.readFileSync(originalPath);
        const upload = new Upload({
          client: s3Client,
          params: {
            Bucket: bucketName,
            Key: fileKey,
            Body: fileContent,
            ContentType: req.file.mimetype,
          },
        });
        
        await upload.done();
        
        // Tạo CloudFront URL cho file gốc
        fileUrl = `${cloudFrontDomain}/${fileKey}`;
        
        // Khởi tạo transformations với URL gốc
        transformations = {
          original: fileUrl
        };
        
        // Upload các phiên bản và lưu URLs
        for (const [version, versionInfo] of Object.entries(versions)) {
          const versionContent = fs.readFileSync(versionInfo.path);
          
          const versionUpload = new Upload({
            client: s3Client,
            params: {
              Bucket: bucketName,
              Key: versionInfo.key,
              Body: versionContent,
              ContentType: versionInfo.mimetype,
            },
          });
          
          await versionUpload.done();
          
          transformations[version] = `${cloudFrontDomain}/${versionInfo.key}`;
          
          // Xóa file phiên bản tạm
          fs.unlinkSync(versionInfo.path);
        }
      } catch (awsError) {
        console.error('AWS S3 Upload failed, using fallback:', awsError.message);
        // Fallback: use local file system
        fileUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${req.file.filename}`;
        transformations = {
          original: fileUrl
        };
        
        // Clean up version files
        for (const [version, versionInfo] of Object.entries(versions)) {
          if (fs.existsSync(versionInfo.path)) {
            fs.unlinkSync(versionInfo.path);
          }
        }
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
        
        let fileUrl;
        let transformations = {};
        
        try {
          // Upload file gốc lên S3 using v3 SDK
          const fileContent = fs.readFileSync(originalPath);
          const upload = new Upload({
            client: s3Client,
            params: {
              Bucket: bucketName,
              Key: fileKey,
              Body: fileContent,
              ContentType: e.mimetype,
            },
          });
          
          await upload.done();
          
          // Tạo CloudFront URL cho file gốc
          fileUrl = `${cloudFrontDomain}/${fileKey}`;
          
          // Khởi tạo transformations với URL gốc
          transformations = {
            original: fileUrl
          };
          
          // Upload các phiên bản và lưu URLs
          for (const [version, versionInfo] of Object.entries(versions)) {
            const versionContent = fs.readFileSync(versionInfo.path);
            
            const versionUpload = new Upload({
              client: s3Client,
              params: {
                Bucket: bucketName,
                Key: versionInfo.key,
                Body: versionContent,
                ContentType: versionInfo.mimetype,
              },
            });
            
            await versionUpload.done();
            
            transformations[version] = `${cloudFrontDomain}/${versionInfo.key}`;
            
            // Xóa file phiên bản tạm
            fs.unlinkSync(versionInfo.path);
          }
        } catch (awsError) {
          console.error('AWS S3 Upload failed, using fallback:', awsError.message);
          // Fallback: use local file system
          fileUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${e.filename}`;
          transformations = {
            original: fileUrl
          };
          
          // Clean up version files
          for (const [version, versionInfo] of Object.entries(versions)) {
            if (fs.existsSync(versionInfo.path)) {
              fs.unlinkSync(versionInfo.path);
            }
          }
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
