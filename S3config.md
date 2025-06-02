## **1. Tạo S3 bucket**

1. Đăng nhập vào AWS Management Console
2. Đi đến dịch vụ S3
3. Nhấn nút **Create bucket**
4. Điền thông tin:
    - Bucket name: `cloud-n7-media` (hoặc tên bạn muốn)
    - Region: Chọn region gần vị trí người dùng của bạn (ví dụ: ap-southeast-1)
    - Các tùy chọn khác giữ mặc định
5. Trong tab **Permissions**:
    - Bỏ chọn "Block all public access"
    - Xác nhận rằng bạn hiểu hậu quả của việc cho phép public access
6. Nhấn **Create bucket**

## **2. Cấu hình CORS cho S3 Bucket**

1. Sau khi tạo bucket, nhấp vào tên bucket để vào trang quản lý
2. Chọn tab **Permissions**
3. Cuộn xuống phần **Cross-origin resource sharing (CORS)**
4. Nhấn **Edit** và thêm cấu hình CORS sau:
```
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3600
    }
]
```
### Bước 3: Tạo CloudFront Distribution

1. Vào AWS Console > **CloudFront > Create Distribution**
2. **Origin domain**: chọn bucket vừa tạo (nó sẽ có dạng `your-bucket.s3.amazonaws.com`)
3. **Origin access**: chọn `Origin access control settings (recommended)`
4. **Origin access control (OAC)**: nhấn `Create new OAC`
    
    → Đặt tên, chọn **Signing behavior: Always** → Tạo
    
5. Gắn OAC vừa tạo vào Origin.
6. **Default behavior**: chọn các config như sau:
    - Viewer protocol policy: `Redirect HTTP to HTTPS`
    - Cache policy: `CachingOptimized`
    - Allowed HTTP methods: `GET, HEAD`
7. Nhấn **Create Distribution**

---

### 🔹 Bước 4: Cập nhật Bucket Policy để cho phép CloudFront truy cập

1. Vào S3 > Bucket > **Permissions** > Bucket policy
2. Dán policy sau (thay `bucket-name`, `distribution-id`, và `account-id`):
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::facebook-media-xyz/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::637423233506:distribution/EDIST123ABC456XYZ"
        }
      }
    }
  ]
}
```
> Replace:
> 
> - `facebook-media-xyz` = tên bucket của bạn
> - `637423233506` = AWS Account ID của bạn
> - `EDIST123ABC456XYZ` = CloudFront distribution ID

---

### 🔹 Bước 5: Test truy cập

- Truy cập CloudFront domain (VD: `https://d123abc1234.cloudfront.net/test.jpg`)
- Nếu hiển thị ảnh → Thành công ✅
- Nếu lỗi AccessDenied → Kiểm tra lại:
    - Bucket policy
    - OAC đã chọn đúng và attach đúng
    - S3 object path chính xác
