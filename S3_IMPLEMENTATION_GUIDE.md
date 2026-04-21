# S3 Refactor - Step-by-Step Implementation Guide

**Created:** April 2026  
**For:** vasireddy-store Team  
**Duration:** ~30-45 minutes to set up

---

## 📋 Pre-Implementation Checklist

Before you start:
- [ ] You have AWS account access
- [ ] You have admin access to the project
- [ ] You have Node.js 18+ installed
- [ ] You have Git for version control
- [ ] You have 30-45 minutes of uninterrupted time

---

## 🔧 Step 1: AWS Setup (10 minutes)

### Step 1.1: Create S3 Bucket

1. Go to [AWS Management Console](https://console.aws.amazon.com)
2. Search for "S3" and click "S3"
3. Click "Create bucket"
4. Fill in:
   - **Bucket name:** `vasireddy-store` (or unique name)
   - **Region:** `us-east-1` (or your region)
5. Click "Create bucket"

### Step 1.2: Make Bucket Public (for image serving)

1. Open the bucket you just created
2. Go to "Permissions" tab
3. Scroll to "Block public access"
4. Click "Edit"
5. Uncheck "Block all public access"
6. Click "Save changes"
7. Confirm the dialog

### Step 1.3: Add Bucket Policy (optional - for public read)

1. Still in "Permissions" tab
2. Scroll to "Bucket policy"
3. Click "Edit"
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::vasireddy-store/*"
    }
  ]
}
```

Replace `vasireddy-store` with your bucket name.

5. Click "Save changes"

### Step 1.4: Create IAM User

1. Go to AWS Management Console
2. Search for "IAM" and click "IAM"
3. Click "Users" (left sidebar)
4. Click "Create user"
5. Username: `vasireddy-store-app`
6. Click "Next"
7. Choose "Attach policies directly"
8. Search for "S3" and select `AmazonS3FullAccess`
9. Click "Next" then "Create user"

### Step 1.5: Create Access Keys

1. Click the user you just created
2. Go to "Security credentials" tab
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose "Application running outside AWS"
6. Click "Next"
7. You can skip "Description" - click "Create access key"
8. **IMPORTANT:** Copy and save:
   - Access Key ID
   - Secret Access Key
   - (These will only be shown once!)

---

## 💻 Step 2: Update Your Local Environment (5 minutes)

### Step 2.1: Update `.env.local`

Create or update `.env.local` in the project root:

```env
# DATABASE and other existing variables stay the same
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="..."
...

# Replace Cloudinary with AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="paste-your-access-key-id-here"
AWS_SECRET_ACCESS_KEY="paste-your-secret-key-here"
AWS_S3_BUCKET_NAME="vasireddy-store"
AWS_CLOUDFRONT_URL=""
```

### Step 2.2: Install Dependencies

```bash
# Navigate to project directory
cd vasireddy-store

# Install new dependencies
npm install

# This will install:
# - @aws-sdk/client-s3
# - @aws-sdk/s3-request-presigner
# - sharp
```

### Step 2.3: Verify Installation

```bash
# Build the project
npm run build

# You should see: ✓ compiled successfully
```

If there are build errors, check:
- All TypeScript files are valid
- All imports are correct
- Dependencies are installed

---

## 🧪 Step 3: Local Testing (10 minutes)

### Step 3.1: Start Development Server

```bash
npm run dev

# Should output:
# ▲ Next.js 15.3.3
# - Local: http://localhost:3000
```

### Step 3.2: Test S3 Upload

1. Open http://localhost:3000/admin/products
2. Look for "Create New Product" section (click to expand)
3. Fill in form:
   - Name: "Test Product"
   - Slug: "test-product"
   - SKU: "TEST-001"
   - Price: "99"
   - Category: Select any category
   - Description: "Test description"
   - Upload Image: Choose a JPG/PNG/WebP file (under 2MB)
4. Click "Create Product"
5. You should see success message

### Step 3.3: Verify in AWS

1. Go to AWS S3 Console
2. Open your bucket
3. Navigate to `products/` folder
4. You should see a folder with image(s)
5. Click on image and view it

### Step 3.4: Verify in Database

1. Check that product was created in database
2. Check that image URL is saved
3. Check that image URL is valid (try opening it)

### Step 3.5: Verify in Browser Console

1. In browser, press `F12` (Developer Tools)
2. Check "Console" tab
3. You should see NO errors
4. If there are errors, check:
   - AWS credentials are correct
   - Bucket name is correct
   - Bucket permissions allow public read

---

## 🚀 Step 4: Update Deployment Environment (10 minutes)

### Step 4.1: Add Variables to Production `.env`

On your production server:

```bash
# SSH into server or use hosting control panel
# Update .env file with same variables:

AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-production-key"
AWS_SECRET_ACCESS_KEY="your-production-secret"
AWS_S3_BUCKET_NAME="your-production-bucket"
AWS_CLOUDFRONT_URL=""
```

**Note:** Consider creating separate IAM user for production with limited permissions.

### Step 4.2: Install Dependencies on Server

```bash
# SSH into server
npm install

# Build the application
npm run build
```

### Step 4.3: Deploy Application

```bash
# Restart application (command depends on your setup)
# Examples:
systemctl restart vasireddy-store  # If using systemd
pm2 restart app                     # If using PM2
node .next/standalone/server.js    # If using standalone
```

---

## 📊 Step 5: Monitor & Verify (5 minutes)

### Step 5.1: Monitor CloudWatch

1. Go to AWS CloudWatch
2. Look for metrics related to S3
3. Check upload count, errors, etc.

### Step 5.2: Test Production

1. Go to production URL
2. Create a test product with image
3. Verify image appears
4. Check S3 bucket for image

### Step 5.3: Monitor Costs

1. Go to AWS Billing
2. Check S3 costs
3. Should be minimal (~$0.02-0.23/month for small usage)

### Step 5.4: Set Up Alerts (Optional)

1. Go to AWS CloudWatch
2. Create alarms for:
   - High upload rate
   - High costs
   - Failed uploads

---

## 🎯 Usage Examples

### Create Product with Image (Backend)

```typescript
// In server action or API route
const imageUrl = await uploadProductImage(imageFile, productId);

await prisma.product.create({
  data: {
    name: "Saree",
    imageUrl: imageUrl,  // S3 URL like: https://bucket.s3.region.amazonaws.com/products/{id}/...
    // ... other fields
  },
});
```

### Update Product Image (Backend)

```typescript
const newImageUrl = await uploadProductImage(newFile, productId);

await prisma.product.update({
  where: { id: productId },
  data: {
    imageUrl: newImageUrl,  // New S3 URL
  },
});
```

### Delete Product (Backend)

```typescript
// Deletes all S3 images
await deleteProductImages(productId);

// Delete from database
await prisma.product.delete({
  where: { id: productId },
});
```

### Get Product Images (Backend)

```typescript
const images = await getProductImages(productId);

images.forEach(img => {
  console.log(img.url);   // Image URL
  console.log(img.key);   // S3 key for deletion
});
```

---

## 🚨 Troubleshooting

### Issue: "S3 is not configured"

**Cause:** Environment variables not set correctly

**Fix:**
1. Check `.env.local` has all 4 required variables
2. Ensure values are not empty or quoted incorrectly
3. Restart dev server: `npm run dev`

### Issue: "Access Denied" Error

**Cause:** IAM user lacks S3 permissions

**Fix:**
1. Go to IAM Console
2. Find your user
3. Add policy: `AmazonS3FullAccess`
4. Wait 1-2 minutes for permissions to propagate
5. Retry upload

### Issue: "Bucket does not exist"

**Cause:** Wrong bucket name or region

**Fix:**
1. Go to S3 Console
2. Verify bucket name matches `.env`
3. Verify region matches `.env`
4. Try again

### Issue: "Image not displaying"

**Cause:** Bucket not publicly readable

**Fix:**
1. Go to S3 bucket
2. Permissions > Block public access
3. Uncheck all options
4. Save changes
5. Refresh page

### Issue: "Build fails - module not found"

**Cause:** Dependencies not installed

**Fix:**
```bash
rm -rf node_modules
npm install
npm run build
```

### Issue: "Upload too slow"

**Cause:** Network or Sharp compression taking time

**Fix:**
1. Check network speed
2. Sharp compression happens once per upload (normal)
3. Consider CloudFront for faster delivery

---

## 📈 Expected Results

After successful setup, you should see:

✅ Products create successfully with images
✅ Images upload to S3 bucket
✅ Images display on product pages
✅ Correct folder structure: `/products/{productId}/`
✅ No console errors
✅ Fast image loading
✅ Cost: Minimal (~$0.02-0.50/month for typical usage)

---

## 🔄 Next Steps

### After Successful Local Setup
1. [ ] Test with different image formats (JPG, PNG, WebP)
2. [ ] Test with maximum file size (2MB)
3. [ ] Test with 5 images per product
4. [ ] Test 6th image rejection
5. [ ] Test product update (image preservation)
6. [ ] Test product deletion (S3 cleanup)

### Before Production Deployment
1. [ ] Create separate S3 bucket for production
2. [ ] Create separate IAM user for production
3. [ ] Test in staging environment
4. [ ] Load test with multiple concurrent uploads
5. [ ] Set up monitoring/alerts
6. [ ] Create backup of existing images (if migrating)

### After Production Deployment
1. [ ] Monitor CloudWatch metrics
2. [ ] Check S3 bucket storage
3. [ ] Monitor error rates
4. [ ] Get user feedback
5. [ ] Optimize if needed

---

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [Project Setup Guide](./S3_SETUP_GUIDE.md)
- [Quick Start](./S3_QUICK_START.md)

---

## ✅ Verification Checklist

After completing all steps, verify:

- [x] S3 bucket created and configured
- [x] IAM user created with S3 permissions
- [x] Access keys created and added to `.env`
- [x] Dependencies installed (`npm install`)
- [x] Build succeeds (`npm run build`)
- [x] Dev server starts (`npm run dev`)
- [x] Product creation with image works
- [x] Images appear in S3 bucket
- [x] Images display on frontend
- [x] No console errors
- [ ] Production setup complete
- [ ] Production tested
- [ ] CloudWatch monitoring active

---

## 🎓 Key Concepts

### S3 Upload Flow
```
Form → File Upload → Sharp Compress → S3 Upload → Return URL → Save to DB
```

### Image Processing
```
Original → Resize (max 1200px) → Compress (80% JPEG) → Upload
```

### Folder Organization
```
Bucket → products/ → {productId}/ → {timestamp}-{random}.jpg
```

### URL Generation
```
S3 Direct: https://bucket.s3.region.amazonaws.com/key
CloudFront: https://cdn.example.com/key
```

---

## 🆘 Support

If you get stuck:

1. Check [S3_SETUP_GUIDE.md](./S3_SETUP_GUIDE.md) - Detailed setup
2. Check [S3_QUICK_START.md](./S3_QUICK_START.md) - Quick reference
3. Check browser console for errors (F12)
4. Check CloudWatch logs for AWS errors
5. Verify AWS credentials are correct
6. Check IAM permissions
7. Verify S3 bucket settings

---

**Version:** 1.0.0  
**Last Updated:** April 21, 2026  
**Status:** ✅ Ready for Implementation
