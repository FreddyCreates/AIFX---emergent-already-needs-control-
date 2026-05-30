# Assets Directory

This directory contains media assets for the ItsNotAILABS landing page.

## Required Video Files

For the advanced design to fully function, add the following video files:

### 1. Logo Animation (`logo-animation.mp4`)
- **Purpose**: Animated logo displayed in the hero section
- **Recommended specs**:
  - Resolution: 400x400px (square)
  - Duration: 3-5 seconds loop
  - Format: MP4 (H.264)
  - File size: Under 2MB
- **Fallback**: A static emoji (🧬) is displayed if video is unavailable

### 2. Introduction Video (`organism-intro.mp4`)
- **Purpose**: Platform introduction video in the showcase section
- **Recommended specs**:
  - Resolution: 1920x1080px (16:9)
  - Duration: 30-90 seconds
  - Format: MP4 (H.264)
  - File size: Under 20MB
- **Poster image**: `video-poster.jpg` (1920x1080px)

## Fallback Behavior

The page is designed to work gracefully without these video files:
- Logo section shows animated emoji with orbiting elements
- Video showcase section shows placeholder with play button overlay

## Adding Custom Assets

1. Export videos in MP4 format with H.264 codec for best compatibility
2. Use WebM format as an additional source for better compression
3. Include poster images for video thumbnails
4. Optimize file sizes using tools like HandBrake or FFmpeg

## Example FFmpeg Commands

```bash
# Convert and compress logo animation
ffmpeg -i input.mov -c:v libx264 -c:a aac -b:v 500k -s 400x400 logo-animation.mp4

# Convert intro video with good quality
ffmpeg -i input.mov -c:v libx264 -c:a aac -b:v 2000k organism-intro.mp4

# Create poster image from video
ffmpeg -i organism-intro.mp4 -ss 00:00:02 -vframes 1 video-poster.jpg

# Create WebVTT captions file (organism-intro-captions.vtt)
# This should be created manually or with a captioning service
```
