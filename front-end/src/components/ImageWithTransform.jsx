import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../services/file';

/**
 * Component hiển thị ảnh với các transformations từ CloudFront
 * 
 * @param {Object} props
 * @param {string} props.src - URL gốc của ảnh
 * @param {string} props.alt - Alt text cho ảnh
 * @param {number} props.width - Chiều rộng yêu cầu
 * @param {number} props.height - Chiều cao yêu cầu 
 * @param {string} props.className - CSS class
 * @param {boolean} props.lazy - Bật/tắt lazy loading
 * @param {Object} props.fileInfo - Thông tin file (transformations, v.v.)
 * @param {string} props.size - Sử dụng phiên bản có sẵn (thumbnail, small, medium, large)
 */
const ImageWithTransform = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  fileInfo,
  size,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState('');
  const [error, setError] = useState(false);
  
  useEffect(() => {
    // Sử dụng hàm utility để lấy URL phù hợp từ các phiên bản đã tạo sẵn
    const transformedUrl = getImageUrl(src, { 
      width,
      fileInfo,
      size
    });
    setImgSrc(transformedUrl);
  }, [src, width, fileInfo, size]);
  
  // Xử lý lỗi và hiển thị ảnh gốc
  const handleError = () => {
    if (!error && src !== imgSrc) {
      setError(true);
      setImgSrc(src);
    }
  };
  
  // Hiển thị placeholder khi chưa có source
  if (!imgSrc) {
    return (
      <div 
        className={`image-placeholder ${className}`}
        style={{ width: width ? `${width}px` : 'auto', height: height ? `${height}px` : 'auto' }}
      />
    );
  }
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      loading={lazy ? 'lazy' : 'eager'}
      className={className}
      {...props}
    />
  );
};

/**
 * Component hiển thị ảnh responsive với các sizes khác nhau
 */
export const ResponsiveImage = ({ 
  src, 
  alt, 
  fileInfo,
  className = '',
  sizes = '(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px',
  ...props 
}) => {
  // Nếu có fileInfo và transformations đã được tạo sẵn
  if (fileInfo?.transformations) {
    return (
      <img 
        srcSet={`
          ${fileInfo.transformations.small || src} 300w,
          ${fileInfo.transformations.medium || src} 600w, 
          ${fileInfo.transformations.large || src} 1200w
        `}
        sizes={sizes}
        src={fileInfo.transformations.medium || src} 
        alt={alt}
        loading="lazy"
        className={className}
        {...props}
      />
    );
  }
  
  // Nếu không có transformations, trả về ảnh gốc
  return (
    <img 
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      {...props}
    />
  );
};

export default ImageWithTransform;
