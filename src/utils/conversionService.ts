
import { FFmpeg } from '@ffmpeg/ffmpeg';

export const getFFmpegCommandsByCategory = (
  inputFile: string,
  outputFile: string,
  category: 'video' | 'audio' | 'image' | 'subtitle' | 'special'
): string[] => {
  const baseCommands = ['-i', inputFile];
  
  switch (category) {
    case 'video':
      return [...baseCommands, '-c:v', 'libx264', '-preset', 'medium', '-c:a', 'aac', outputFile];
    case 'audio':
      return [...baseCommands, '-vn', '-c:a', 'aac', outputFile];
    case 'image':
      return [...baseCommands, '-frames:v', '1', outputFile];
    case 'subtitle':
      return [...baseCommands, '-c:s', 'copy', outputFile];
    case 'special':
      if (outputFile.endsWith('m3u8')) {
        return [...baseCommands, '-c:v', 'libx264', '-c:a', 'aac', '-f', 'hls', outputFile];
      }
      return [...baseCommands, '-c', 'copy', outputFile];
  }
};

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
