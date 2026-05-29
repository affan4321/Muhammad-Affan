# Deployment Guide

This guide covers deploying the Dark Tunnel Portfolio to Vercel, with Cloudflare R2 for large model and audio files.

## Important: Large Asset Files

The project contains large 3D model files and audio files that are excluded from git:
- `/public/models/*` - 3D model files (gitignored)
- `/public/audio/*` - Audio files (gitignored)

These files must be hosted separately using Cloudflare R2.

## Cloudflare R2 Setup

Your R2 bucket is already set up with:
- **Bucket name**: `muhammad-affan-portfolio-assets`
- **S3 API URL**: `https://f80ab5850311ec5bb7df99128daea526.r2.cloudflarestorage.com`
- **Folders**: `audio/`, `models/`

### 1. Upload Assets to R2

```bash
# Upload all models
for file in public/models/*; do
  wrangler r2 object put muhammad-affan-portfolio-assets/models/$(basename "$file") --file="$file"
done

# Upload all audio files
for file in public/audio/*; do
  wrangler r2 object put muhammad-affan-portfolio-assets/audio/$(basename "$file") --file="$file"
done
```

### 2. Enable Public Access

```bash
# Set public access
wrangler r2 bucket public muhammad-affan-portfolio-assets
```

Your files will be accessible at:
`https://f80ab5850311ec5bb7df99128daea526.r2.cloudflarestorage.com/muhammad-affan-portfolio-assets/<filename>`

### 3. Update Code to Use R2 URLs

The public access URL pattern for your assets is:
```
https://f80ab5850311ec5bb7df99128daea526.r2.cloudflarestorage.com/muhammad-affan-portfolio-assets/<folder>/<filename>
```

Update your asset paths in code to use R2 URLs:
- Change `/models/xxx.glb` to `https://f80ab5850311ec5bb7df99128daea526.r2.cloudflarestorage.com/muhammad-affan-portfolio-assets/models/xxx.glb`
- Change `/audio/xxx.mp3` to `https://f80ab5850311ec5bb7df99128daea526.r2.cloudflarestorage.com/muhammad-affan-portfolio-assets/audio/xxx.mp3`

Example for your GTA San Andreas Theme:
```
https://f80ab5850311ec5bb7df99128daea526.r2.cloudflarestorage.com/muhammad-affan-portfolio-assets/audio/GTA%20San%20Andreas%20Theme.mp3
```

## Vercel Deployment

### Automatic Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically deploy on push

### Manual Deployment

```bash
npm run build
vercel --prod
```

### Environment Variables

Set these in Vercel dashboard:
- `R2_BUCKET_URL`: Your R2 bucket URL
- `NODE_ENV`: `production`

## Asset Optimization

### Compress Models

Use Draco compression for GLB/GLTF files:
```bash
# Install draco-tools
npm install -g draco-tools

# Compress model
gltf-draco-compressor -i public/models/your-model.glb -o public/models/your-model-compressed.glb
```

### Optimize Audio

Compress audio files:
```bash
# Using ffmpeg
ffmpeg -i public/audio/bg.mp3 -b:a 128k public/audio/bg-optimized.mp3
```

## Post-Deployment Checklist

- [ ] Models load correctly in production
- [ ] Audio plays correctly
- [ ] Background music switches between tracks
- [ ] Sound effects trigger at correct milestones
- [ ] Camera controls work properly
- [ ] PDF viewer displays correctly
- [ ] Settings persist across sessions
- [ ] Fullscreen toggle works

## Troubleshooting

### Models Not Loading

- Check CDN URLs are correct
- Verify CORS settings on CDN
- Check browser console for errors
- Ensure model files are accessible

### Audio Not Playing

- Verify audio files are uploaded
- Check browser autoplay policies
- Ensure audio context is resumed
- Check mute state in settings

### Build Errors

- Verify Node version matches (20)
- Check all dependencies are installed
- Ensure TypeScript compiles without errors
- Check build output directory is correct

## Performance Tips

1. **Use CDN for assets** - Faster loading globally
2. **Enable compression** - Reduce file sizes
3. **Use immutable caching** - Set long cache headers
4. **Lazy load models** - Load only when needed
5. **Optimize textures** - Use compressed formats
