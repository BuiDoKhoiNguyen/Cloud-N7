import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/**
 * Tạo các phiên bản khác nhau của ảnh trước khi upload lên S3
 * @param {string} filePath - Đường dẫn đến file ảnh
 * @param {string} mimetype - MIME type của file
 * @returns {Object} - Object chứa thông tin về các phiên bản và đường dẫn của chúng
 */
export async function createImageVersions(filePath, mimetype) {
  // Chỉ xử lý file image
  if (!mimetype.startsWith('image/')) {
    return {
      originalPath: filePath,
      versions: {}
    };
  }

  const fileName = path.basename(filePath);
  const fileDir = path.dirname(filePath);
  const fileNameWithoutExt = path.parse(fileName).name;
  const versions = {};
  
  try {
    // Tạo thư mục versions nếu chưa có
    const versionsDir = path.join(fileDir, 'versions');
    if (!fs.existsSync(versionsDir)) {
      fs.mkdirSync(versionsDir);
    }
    
    // Tạo thumbnail (150x150)
    const thumbnailPath = path.join(versionsDir, `${fileNameWithoutExt}_thumbnail.webp`);
    await sharp(filePath)
      .resize(150, 150, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    versions.thumbnail = {
      path: thumbnailPath,
      key: `uploads/versions/${fileNameWithoutExt}_thumbnail.webp`,
      mimetype: 'image/webp'
    };
    
    // Tạo phiên bản small (300px width)
    const smallPath = path.join(versionsDir, `${fileNameWithoutExt}_small.webp`);
    await sharp(filePath)
      .resize(300, null, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(smallPath);
    versions.small = {
      path: smallPath,
      key: `uploads/versions/${fileNameWithoutExt}_small.webp`,
      mimetype: 'image/webp'
    };
    
    // Tạo phiên bản medium (600px width)
    const mediumPath = path.join(versionsDir, `${fileNameWithoutExt}_medium.webp`);
    await sharp(filePath)
      .resize(600, null, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(mediumPath);
    versions.medium = {
      path: mediumPath,
      key: `uploads/versions/${fileNameWithoutExt}_medium.webp`,
      mimetype: 'image/webp'
    };
    
    // Tạo phiên bản large (1200px width)
    const largePath = path.join(versionsDir, `${fileNameWithoutExt}_large.webp`);
    await sharp(filePath)
      .resize(1200, null, { fit: 'inside' })
      .webp({ quality: 80 })
      .toFile(largePath);
    versions.large = {
      path: largePath,
      key: `uploads/versions/${fileNameWithoutExt}_large.webp`,
      mimetype: 'image/webp'
    };
    
    return {
      originalPath: filePath,
      versions
    };
  } catch (error) {
    console.error('Error creating image versions:', error);
    return {
      originalPath: filePath,
      versions: {}
    };
  }
}
