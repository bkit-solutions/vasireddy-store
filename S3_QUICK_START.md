# S3 Quick Start Guide

## 🚀 5-Minute Setup

### 1. Create AWS S3 Bucket
```bash
# Via AWS Console
1. Go to S3 service
2. Click "Create bucket"
3. Name: "vasireddy-store" (or your preference)
4. Region: "us-east-1" (or your preferred region)
5. Click "Create bucket"
```

### 2. Create IAM User
```bash
# Via AWS Console
1. Go to IAM service
2. Create new user
3. Attach policy: AmazonS3FullAccess (or create custom policy)
4. Create Access Key
5. Copy Access Key ID and Secret Access Key
```

### 3. Configure Environment Variables
```env
# .env.local or .env

# AWS S3 Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-here"
AWS_SECRET_ACCESS_KEY="your-secret-key-here"
AWS_S3_BUCKET_NAME="vasireddy-store"

# Optional - for CloudFront (skip if not using CDN)
AWS_CLOUDFRONT_URL=""
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Test Upload
```bash
# Start dev server
npm run dev

# Go to http://localhost:3000/admin/products
# Create or update a product
# Upload an image
# Check if it appears in your S3 bucket
```

## 📁 Project Structure

```
lib/
├── s3-uploader.ts      # Core S3 upload logic
├── s3-utils.ts         # Utility functions
├── product-image.ts    # Image upload wrapper
└── cloudinary.ts       # ⚠️ Deprecated (can delete)

app/api/admin/
├── s3-presigned-url/   # Generate upload URLs
└── s3-delete/          # Delete images from S3

.env                    # Environment variables
```

## 🔑 Key Functions

### Upload an Image
```typescript
import { uploadProductImage } from "@/lib/product-image";

const imageUrl = await uploadProductImage(file, productId);
```

### Get Product Images
```typescript
import { getProductImages } from "@/lib/s3-utils";

const images = await getProductImages(productId);
images.forEach(img => {
  console.log(img.url);  // Image URL
  console.log(img.key);  // S3 key (for deletion)
});
```

### Delete Product Images
```typescript
import { deleteProductImages } from "@/lib/s3-utils";

await deleteProductImages(productId);  // Delete all
```

## 📊 Common Tasks

### Get Image Count
```typescript
import { getProductImageCount } from "@/lib/s3-uploader";

const count = await getProductImageCount(productId);
console.log(`Product has ${count} images`);
```

### Validate S3 Config
```typescript
import { validateS3Configuration } from "@/lib/s3-utils";

const { valid, errors } = validateS3Configuration();
if (!valid) {
  console.error("S3 config errors:", errors);
}
```

### Check if S3 is Configured
```typescript
import { isS3Configured } from "@/lib/s3-uploader";

if (!isS3Configured()) {
  console.log("Using local storage (S3 not configured)");
}
```

## 🐛 Troubleshooting

### Error: "S3 is not configured"
**Solution:** Check your `.env` file has all 4 required variables
```env
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET_NAME=
```

### Error: "Access Denied"
**Solution:** Check IAM user permissions. Needs:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`
- `s3:ListBucket`

### Error: "The specified bucket does not exist"
**Solution:** Verify bucket name matches and bucket exists in the specified region

### Images upload but can't view
**Solution:** Check bucket permissions. Images must be publicly accessible:
1. Go to bucket settings
2. Disable "Block all public access"
3. Add bucket policy allowing GetObject

## 📈 Monitoring S3

### View Images in Bucket
1. Go to AWS S3 Console
2. Click on bucket name
3. Navigate to `products/` folder
4. See all uploaded images

### Check Storage Size
1. AWS S3 Console
2. Bucket > Metrics tab
3. Check "Storage" graph

### Monitor Costs
1. AWS Billing Console
2. S3 shows charges under "Compute"
3. Typical costs: storage + requests

## 🚀 Deployment Checklist

Before going live:
- [ ] S3 bucket exists
- [ ] IAM user has correct permissions
- [ ] Credentials in `.env` on server
- [ ] Dependencies installed: `npm install`
- [ ] Build succeeds: `npm run build`
- [ ] Test upload works
- [ ] Images are accessible
- [ ] CloudFront configured (if using CDN)

## 🔗 Useful Links

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://github.com/aws/aws-sdk-js-v3)
- [Sharp Image Library](https://sharp.pixelplumbing.com/)
- [CloudFront CDN](https://aws.amazon.com/cloudfront/)

## 💡 Tips & Tricks

### Use CloudFront for Speed
```env
# 1. Create CloudFront distribution
# 2. Point to your S3 bucket
# 3. Add to .env:
AWS_CLOUDFRONT_URL="https://d123456.cloudfront.net"
```

### Set Cache Headers
- Images are cached for 1 year (immutable)
- Good for performance
- Don't need to invalidate cache

### Organize Images by Product
- Images stored: `products/{productId}/`
- Easy to find and delete
- Easy to manage permissions per product

### Monitor Upload Speed
```typescript
const start = Date.now();
const result = await uploadToS3(file, productId);
const duration = Date.now() - start;
console.log(`Upload took ${duration}ms`);
```

---

**Need help?** Check [S3_SETUP_GUIDE.md](./S3_SETUP_GUIDE.md) for detailed instructions.
