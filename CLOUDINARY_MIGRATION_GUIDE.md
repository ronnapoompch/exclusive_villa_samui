# Cloudinary Migration Guide

## 📋 Steps to Migrate Images to Cloudinary

### 1️⃣ Create Cloudinary Account
- ✅ Go to https://cloudinary.com/users/register/free
- Sign up for free account (25 GB storage)
- Verify email

### 2️⃣ Get Cloudinary Credentials
After login, go to Dashboard:
- **Cloud Name**: (e.g., dxxxxx)
- **API Key**: (e.g., 123456789012345)
- **API Secret**: (e.g., abcdefghijklmnopqrstuvwxyz)

### 3️⃣ Set Environment Variables

#### Local Development (.env.local):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Vercel Production:
Go to Vercel Dashboard → Project Settings → Environment Variables:
- Add `CLOUDINARY_CLOUD_NAME`
- Add `CLOUDINARY_API_KEY`
- Add `CLOUDINARY_API_SECRET`

### 4️⃣ Install Cloudinary Package
```powershell
npm install cloudinary
```

### 5️⃣ Upload Images to Cloudinary
```powershell
# Edit upload-to-cloudinary.js and set your credentials
# Then run:
node upload-to-cloudinary.js
```

**Upload Details:**
- Total images: ~20,769
- Batch size: 10 images per batch
- Estimated time: ~35 minutes
- Creates folder: `exclusive-villa-samui/villas/{villa-id}/{category}/`

**Progress:**
```
📁 Found 210 villa folders
📸 Total images to upload: 20,769
⏱️  Estimated time: 35 minutes

✅ Uploaded: villa-001/hero/image1.jpg
✅ Uploaded: villa-001/hero/image2.jpg
...
📊 Progress: 100/20769 (100 success, 0 failed)
```

### 6️⃣ Update Villa JSON with Cloudinary URLs
```powershell
# Set CLOUDINARY_CLOUD_NAME in environment
$env:CLOUDINARY_CLOUD_NAME = "your_cloud_name"

# Run update script
node update-villa-cloudinary-urls.js
```

**What it does:**
- Converts all `/api/images/` paths to Cloudinary URLs
- Creates backups: `folder-based-villas.backup.json`
- Updates both JSON files with new URLs

**Before:**
```json
"image": "/api/images/villa-001/hero/hero1.jpg"
```

**After:**
```json
"image": "https://res.cloudinary.com/your_cloud_name/image/upload/exclusive-villa-samui/villas/villa-001/hero/hero1.jpg"
```

### 7️⃣ Update VillaCard Component

Remove path conversion logic since we now have direct Cloudinary URLs:

**File:** `src/components/VillaCard.tsx`

**Before:**
```typescript
const imageUrl = villa.image.replace('/api/images/', '/optimized-data-images/');
```

**After:**
```typescript
const imageUrl = villa.image; // Already Cloudinary URL
```

### 8️⃣ Update .vercelignore

Re-enable image folder exclusion (no need to deploy local images):

```
# Exclude local images (using Cloudinary CDN)
public/optimized-data-images/
```

### 9️⃣ Test Locally
```powershell
npm run dev
```

Check that images load from Cloudinary URLs.

### 🔟 Deploy to Vercel
```powershell
git add .
git commit -m "Migrate to Cloudinary CDN for image hosting"
git push
vercel --prod
```

## 📊 Benefits of Cloudinary

✅ **No File Limits**: Unlimited images (within 25 GB)
✅ **Automatic Optimization**: Auto format (WebP), quality, compression
✅ **CDN Delivery**: Fast loading from nearest server
✅ **Transformations**: Resize, crop, format on-the-fly
✅ **Free Tier**: 25 GB storage, 25 GB bandwidth/month

## 🔍 Verify Upload

Check Cloudinary Dashboard:
- Go to Media Library
- Filter by folder: `exclusive-villa-samui`
- Should see 20,769 images organized by villa and category

## 🚨 Troubleshooting

### Upload fails with "Invalid credentials"
- Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Verify credentials in Cloudinary Dashboard

### Images not displaying
- Check browser console for errors
- Verify Cloudinary URLs are correct
- Test URL directly in browser

### "Quota exceeded" error
- Check Cloudinary usage in Dashboard
- May need to upgrade plan or delete old images

## 📝 Rollback Plan

If needed to revert:
```powershell
# Restore backup
cp data/folder-based-villas.backup.json data/folder-based-villas.json
cp data/folder-based-villas-array.backup.json data/folder-based-villas-array.json

# Revert VillaCard.tsx
git checkout src/components/VillaCard.tsx
```

## ⏱️ Timeline

- **Step 1-3**: 5 minutes (account + credentials)
- **Step 4**: 1 minute (install package)
- **Step 5**: 35 minutes (upload images)
- **Step 6**: 1 minute (update JSON)
- **Step 7-8**: 2 minutes (code updates)
- **Step 9**: 2 minutes (local testing)
- **Step 10**: 3 minutes (deploy)

**Total: ~50 minutes**
