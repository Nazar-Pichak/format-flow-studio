
export const getFFmpegCommandsByCategory = (
  inputFile: string,
  outputFile: string,
  category: 'video' | 'audio' | 'image' | 'subtitle' | 'special'
): string[] => {
  const base = ['-i', inputFile];
  const ext = outputFile.split('.').pop()?.toLowerCase() || '';

  switch (category) {
    case 'video':
      switch (ext) {
        case 'mp4':
        case 'm4v': // Both use MP4 container
          return [...base, '-c:v', 'libx264', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', outputFile];

        case 'avi':
          return [...base, '-c:v', 'mpeg4', '-vtag', 'xvid', '-c:a', 'libmp3lame', outputFile];

        case 'mov':
          return [...base, '-c:v', 'prores_ks', '-profile:v', '3', '-c:a', 'aac', outputFile];

        case 'mkv':
          return [...base, '-c:v', 'libx264', '-c:a', 'aac', outputFile];

        case 'flv':
          return [...base, '-c:v', 'flv', '-c:a', 'libmp3lame', outputFile];

        case 'wmv':
          return [...base, '-c:v', 'wmv2', '-c:a', 'wmav2', outputFile];

        case 'webm':
          return [...base, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', outputFile];

        case 'mpg':
        case 'mpeg':
          return [...base, '-c:v', 'mpeg2video', '-c:a', 'mp2', outputFile];

        case '3gp':
          return [...base, '-c:v', 'h263', '-c:a', 'aac', outputFile];

        case 'ts':
          return [...base, '-c:v', 'libx264', '-c:a', 'aac', '-f', 'mpegts', outputFile];

        default:
          return [...base, '-c:v', 'libx264', '-c:a', 'aac', outputFile];
      }


    case 'audio':
      switch (ext) {
        case 'mp3':
          return [...base, '-vn', '-c:a', 'libmp3lame', '-q:a', '2', outputFile];

        case 'aac':
          return [...base, '-vn', '-c:a', 'aac', '-b:a', '192k', outputFile];

        case 'wav':
          return [...base, '-vn', '-c:a', 'pcm_s16le', outputFile];

        case 'flac':
          return [...base, '-vn', '-c:a', 'flac', outputFile];

        case 'ogg':
          return [...base, '-vn', '-c:a', 'libvorbis', outputFile];

        case 'm4a':
          // Note: .m4a is typically AAC audio in MP4 container
          return [...base, '-vn', '-c:a', 'aac', '-b:a', '192k', '-f', 'ipod', outputFile];

        case 'wma':
          // FFmpeg doesn't natively encode WMA — fallback to WMAV2
          return [...base, '-vn', '-c:a', 'wmav2', '-b:a', '192k', outputFile];

        case 'opus':
          return [...base, '-vn', '-c:a', 'libopus', '-b:a', '96k', outputFile];

        case 'alac':
          return [...base, '-vn', '-c:a', 'alac', outputFile];

        case 'amr':
          // AMR-NB requires 8000 Hz mono input
          return [...base, '-vn', '-ar', '8000', '-ac', '1', '-c:a', 'libopencore_amrnb', outputFile];

        default:
          return [...base, '-vn', '-c:a', 'aac', outputFile];
      }


    case 'image':
      switch (ext) {
        case 'jpg':
        case 'jpeg':
          return [...base, '-frames:v', '1', '-q:v', '2', outputFile]; // High-quality JPEG

        case 'png':
          return [...base, '-frames:v', '1', '-compression_level', '3', outputFile];

        case 'bmp':
          return [...base, '-frames:v', '1', outputFile]; // BMP is uncompressed

        case 'tiff':
        case 'tif':
          return [...base, '-frames:v', '1', '-compression_algo', 'deflate', outputFile];

        case 'gif':
          return [...base, '-vf', 'fps=10,scale=320:-1:flags=lanczos', '-t', '5', outputFile]; // 5s looping gif

        case 'webp':
          return [...base, '-frames:v', '1', '-lossless', '1', outputFile];

        default:
          return [...base, '-frames:v', '1', outputFile];
      }


    case 'subtitle':
      switch (ext) {
        case 'srt':
          return [...base, '-c:s', 'srt', outputFile];

        case 'ass':
          return [...base, '-c:s', 'ass', outputFile];

        case 'vtt':
          return [...base, '-c:s', 'webvtt', outputFile];

        case 'sub':
          return [...base, '-c:s', 'mov_text', outputFile]; // .sub can be ambiguous, 'mov_text' is safe for mp4

        default:
          return [...base, '-c:s', 'copy', outputFile];
      }


    case 'special':
      switch (ext) {
        case 'm3u8': // HLS
          return [...base, '-c:v', 'libx264', '-c:a', 'aac', '-f', 'hls', outputFile];

        case 'mpd': // MPEG-DASH
          return [...base, '-c:v', 'libx264', '-c:a', 'aac', '-f', 'dash', outputFile];

        case 'iso': // DVD ISO
          // ISO creation from video files is not natively supported by ffmpeg.
          // You'll need additional tools like `genisoimage` or `mkisofs`.
          throw new Error('ISO creation is not supported by FFmpeg directly');

        case 'vob': // DVD Video
          return [...base, '-target', 'ntsc-dvd', outputFile]; // use 'pal-dvd' if needed

        case 'dv': // Digital Video
          return [...base, '-target', 'ntsc-dv', outputFile]; // or 'pal-dv'

        case 'rm': // RealMedia
          return [...base, '-c:v', 'rv10', '-c:a', 'cook', '-f', 'rm', outputFile];

        default:
          return [...base, '-c', 'copy', outputFile]; // fallback
      }

}};


  export const isValidFileType = (file: File | null, category: string): boolean => {
    // Handle null or undefined file
    if (!file) {
      return false;
    }

    const mimeTypes: Record<string, string[]> = {
      video: ['video/'],
      audio: ['audio/'],
      image: ['image/'],
      subtitle: ['text/plain', 'text/vtt', 'application/x-subrip'],
      special: ['application/x-mpegURL', 'video/MP2T', 'application/x-iso9660-image']
    };

    // Make sure we're checking a valid category
    if (!category || !mimeTypes[category]) {
      return false;
    }

    return mimeTypes[category].some(type =>
      file.type.startsWith(type)
    ) || true; // Temporarily allowing all files for testing
  };
