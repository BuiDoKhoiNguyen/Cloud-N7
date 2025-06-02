/**
 * Tạo URL cho ảnh với các tham số transformation
 * @param {string} baseUrl - CloudFront URL gốc
 * @param {Object} options - Các options cho transformation
 * @param {number} options.width - Chiều rộng mong muốn
 * @param {number} options.height - Chiều cao mong muốn
 * @param {string} options.format - Định dạng ảnh (webp, jpeg, png...)
 * @param {number} options.quality - Chất lượng ảnh (1-100)
 * @returns {string} URL đã được transform
 */
export function getImageUrl(baseUrl, options = {}) {
  if (!baseUrl) return '';
  
  const url = new URL(baseUrl);
  
  // Thêm các tham số transformation
  if (options.width) {
    url.searchParams.set('width', options.width);
  }
  
  if (options.height) {
    url.searchParams.set('height', options.height);
  }
  
  if (options.format) {
    url.searchParams.set('format', options.format);
  }
  
  if (options.quality) {
    url.searchParams.set('quality', options.quality);
  }
  
  return url.toString();
}

/**
 * Tạo các phiên bản khác nhau của một ảnh
 * @param {string} baseUrl - CloudFront URL gốc
 * @returns {Object} Các URL cho các phiên bản khác nhau
 */
export function generateImageVariants(baseUrl) {
  return {
    original: baseUrl,
    thumbnail: getImageUrl(baseUrl, { width: 150, height: 150, format: 'webp' }),
    small: getImageUrl(baseUrl, { width: 300, format: 'webp' }),
    medium: getImageUrl(baseUrl, { width: 600, format: 'webp' }),
    large: getImageUrl(baseUrl, { width: 1200, format: 'webp' }),
  };
}
