class Api {
  getFileById = id =>
    fetch(`${import.meta.env.VITE_SERVER_URL}files/${id}`, {
      credentials: 'include',
    })
      .then(async res => {
        if (res.ok) return res.json()
        return res.json().then(res => { throw new Error(res.error.message) })
      })
}


export function determineFileSource(url) {
  if (!url) return 'unknown';
  
  if (url.includes('cloudinary.com')) {
    return 'cloudinary';
  } 
  
  // Kiểm tra CloudFront domain (nếu đã được config)
  const cloudfrontDomain = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
  if (cloudfrontDomain && url.includes(cloudfrontDomain)) {
    return 'cloudfront';
  }
  
  // Fallback: kiểm tra các pattern CloudFront domain thông thường
  if (url.includes('.cloudfront.net')) {
    return 'cloudfront';
  }
  
  return 'other';
}

/**
 * Xác định định dạng ảnh tối ưu cho trình duyệt
 */
export function getOptimalImageFormat() {
  if (typeof window === 'undefined') return 'jpg';
  
  // Kiểm tra trình duyệt có hỗ trợ WebP
  const canUseWebP = () => {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  };
  
  // Kiểm tra trình duyệt có hỗ trợ AVIF
  const canUseAVIF = () => {
    const img = new Image();
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK';
    return img.complete;
  };
  
  if (canUseAVIF()) return 'avif';
  if (canUseWebP()) return 'webp';
  return 'jpg';
}

/**
 * Tạo URL cho ảnh từ transformations đã được tạo sẵn
 */
export function getImageUrl(url, options = {}) {
  if (!url) return '';
  
  // Xác định nguồn file
  const source = determineFileSource(url);
  
  // Nếu là Cloudinary, sử dụng URL gốc
  if (source === 'cloudinary') {
    return url;
  }
  
  // Nếu là CloudFront, sử dụng phiên bản phù hợp nếu có
  if (source === 'cloudfront') {
    // Nếu có fileInfo.transformations, sử dụng phiên bản phù hợp
    if (options.fileInfo && options.fileInfo.transformations) {
      const { width } = options;
      
      if (width) {
        // Chọn phiên bản phù hợp dựa trên width yêu cầu
        if (width <= 150) {
          return options.fileInfo.transformations.thumbnail || url;
        } else if (width <= 300) {
          return options.fileInfo.transformations.small || url;
        } else if (width <= 600) {
          return options.fileInfo.transformations.medium || url;
        } else if (width <= 1200) {
          return options.fileInfo.transformations.large || url;
        }
      }
      
      // Nếu options.size được chỉ định cụ thể
      if (options.size && options.fileInfo.transformations[options.size]) {
        return options.fileInfo.transformations[options.size];
      }
    }
  }
  
  // URL khác hoặc không có transformations, trả về nguyên bản
  return url;
}

export default new Api()