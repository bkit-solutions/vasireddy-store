# S3 Image Upload Refactor - Complete Guide

## Overview
The application has been completely refactored to use **AWS S3** instead of Cloudinary for all image uploads. This provides better performance, cost efficiency, and more control over image storage.

## Features

✅ **AWS S3 Integration**
- Stores images under `/products/{productId}/` structure
- Automatic image compression and resizing
- Support for JPG, PNG, WebP formats
- 2MB max file size per image
- Limit of 5 images per product

✅ **Image Processing**
- Automatic compression using Sharp
- Images resized to max 1200px width
- JPEG quality set to 80% for optimal file size
- Progressive JPEG encoding

✅ **Scalability**
- CloudFront support for CDN delivery
- Direct S3 URL fallback
- Configurable AWS region
- Automatic metadata tagging

## Environment Setup

### 1. AWS S3 Configuration

Create an S3 bucket and an IAM user with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### 2. Update `.env` File

Add these variables to your `.env` or `.env.local`:

```env
# AWS S3 Configuration for Image Uploads
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Optional: CloudFront URL for faster image delivery
# Leave empty to use S3 direct URL
AWS_CLOUDFRONT_URL=""
```

### 3. AWS Credentials

Get your AWS credentials:
1. Go to AWS Management Console
2. Navigate to IAM > Users
3. Create a new user or select existing
4. Create Access Key
5. Copy the Access Key ID and Secret Access Key
6. Add them to `.env`

### 4. CloudFront Setup (Optional)

If you want faster image delivery:

1. Create a CloudFront distribution pointing to your S3 bucket
2. Set the origin to: `your-bucket-name.s3.region.amazonaws.com`
3. Copy the distribution domain name
4. Add to `.env`:
```env
AWS_CLOUDFRONT_URL="https://d123456.cloudfront.net"
```

## File Structure

### New Files
- **`lib/s3-uploader.ts`** - S3 upload utility with compression and validation
- **`FIXES_APPLIED.md`** - Summary of all changes made

### Modified Files
- **`lib/product-image.ts`** - Now uses S3 instead of Cloudinary
- **`app/(admin)/admin/products/page.tsx`** - Updated to pass productId during uploads
- **`.env`** - Replaced Cloudinary with S3 variables
- **`package.json`** - Added AWS SDK and Sharp dependencies

## How It Works

### Image Upload Flow

```
1. User uploads image in admin dashboard
2. Validation checks:
   - File format (JPG, PNG, WebP only)
   - File size (max 2MB)
   - Product image count (max 5)
3. Sharp compresses and resizes image
4. Uploads to S3 under: /products/{productId}/{filename}
5. Returns URL:
   - If CloudFront configured: CloudFront URL
   - Otherwise: Direct S3 URL
```

### S3 Folder Structure

```
my-bucket/
├── products/
│   ├── {productId1}/
│   │   ├── 1705123456789-abc123def.jpg
│   │   ├── 1705123457890-def456ghi.jpg
│   │   └── ...
│   ├── {productId2}/
│   │   └── ...
```

## API Reference

### `lib/s3-uploader.ts`

#### `isS3Configured(): boolean`
Check if S3 is properly configured.

```typescript
if (isS3Configured()) {
  // S3 is ready to use
}
```

#### `uploadToS3(file: File, productId: string): Promise<S3UploadResponse>`
Upload an image to S3.

```typescript
const response = await uploadToS3(imageFile, productId);
console.log(response.url);  // Image URL
console.log(response.key);  // S3 key (for deletion)
```

#### `compressImage(buffer: Buffer, mimeType: string): Promise<{ buffer: Buffer; format: string }>`
Compress and resize an image.

```typescript
const { buffer, format } = await compressImage(imageBuffer, 'image/png');
```

#### `getProductImageCount(productId: string): Promise<number>`
Get the number of images uploaded for a product.

```typescript
const count = await getProductImageCount(productId);
if (count >= 5) {
  throw new Error("Max images reached");
}
```

#### `deleteFromS3(key: string): Promise<void>`
Delete an image from S3.

```typescript
await deleteFromS3('products/{productId}/image.jpg');
```

## Usage Examples

### Create Product with Image

```typescript
// In admin products page
const imageUrl = await uploadProductImage(imageFile, productId);

await prisma.product.create({
  data: {
    name: "Product Name",
    imageUrl: imageUrl,  // S3 URL
    // ... other fields
  },
});
```

### Update Product Image

```typescript
const imageUrl = await uploadProductImage(newImageFile, productId);

await prisma.product.update({
  where: { id: productId },
  data: {
    imageUrl: imageUrl,  // New S3 URL
  },
});
```

## Troubleshooting

### Error: "S3 is not configured"
**Solution:** Check your `.env` file. Ensure all required AWS variables are set:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`

### Error: "Unsupported file type"
**Solution:** Only JPG, PNG, and WebP are supported. Other formats will be rejected.

### Error: "Image size must be 2MB or smaller"
**Solution:** Your image is too large. Compress it first or use a smaller image.

### Error: "Maximum 5 images per product allowed"
**Solution:** You've reached the limit of 5 images per product. Delete old images first.

### S3 Upload Fails, Falls Back to Local Storage
**Cause:** S3 credentials are invalid or permissions are insufficient.
**Solution:** 
1. Verify AWS credentials in `.env`
2. Check IAM user permissions
3. Ensure S3 bucket exists in the correct region

## Migration from Cloudinary

All Cloudinary references have been removed:
- ✅ Removed `lib/cloudinary.ts` imports
- ✅ Updated `lib/product-image.ts` to use S3
- ✅ Updated admin products page
- ✅ Updated `.env` variables
- ✅ Updated `package.json` dependencies

**Note:** The `lib/cloudinary.ts` file is deprecated but kept for reference.

## Performance Optimization

### Image Compression Benefits
- **Before:** Cloudinary automatic compression
- **After:** Sharp-based compression with 80% JPEG quality
- **Result:** Faster uploads, smaller file sizes, reduced bandwidth

### CDN Integration (Optional)
- Use CloudFront for global content delivery
- Cache images for 1 year (immutable)
- Automatic GZIP compression
- Reduced latency for users worldwide

## Cost Estimation

### AWS S3 Pricing (us-east-1)
- Storage: $0.023 per GB/month
- Upload: Free
- Download: $0.09 per GB
- Requests: $0.0004 per 1,000 PUT requests

### Example
- 1,000 products × 5 images × 200KB = 1GB storage
- Monthly cost: ~$0.023 + $0.40 (requests) = **~$0.42**

Compare with Cloudinary:
- Basic plan: $99/month for 10GB storage + transformations

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set AWS Credentials in `.env`**
   ```bash
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_S3_BUCKET_NAME=your-bucket
   AWS_REGION=us-east-1
   ```

3. **Test Upload**
   - Go to admin dashboard
   - Create or update a product
   - Upload an image
   - Verify image appears correctly

4. **Monitor S3 Usage**
   - Check CloudWatch for upload/download metrics
   - Monitor storage size
   - Adjust CloudFront settings as needed

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review AWS S3 documentation: https://docs.aws.amazon.com/s3/
3. Check Sharp documentation: https://sharp.pixelplumbing.com/

---

**Last Updated:** April 2026
**Version:** 1.0.0
