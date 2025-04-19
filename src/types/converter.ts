
export interface Format {
  value: string;
  label: string;
}

export type ConversionStatus = 'idle' | 'converting' | 'completed' | 'error';
export type FileCategory = 'video' | 'audio' | 'image' | 'subtitle' | 'special';

export const videoFormats: Format[] = [
  { value: 'mp4', label: 'MP4' },
  { value: 'avi', label: 'AVI' },
  { value: 'mov', label: 'MOV' },
  { value: 'mkv', label: 'MKV' },
  { value: 'flv', label: 'FLV' },
  { value: 'wmv', label: 'WMV' },
  { value: 'webm', label: 'WebM' },
  { value: 'mpeg', label: 'MPEG' },
  { value: '3gp', label: '3GP' },
  { value: 'ts', label: 'TS' },
  { value: 'm4v', label: 'M4V' },
];

export const audioFormats: Format[] = [
  { value: 'mp3', label: 'MP3' },
  { value: 'aac', label: 'AAC' },
  { value: 'wav', label: 'WAV' },
  { value: 'flac', label: 'FLAC' },
  { value: 'ogg', label: 'OGG' },
  { value: 'm4a', label: 'M4A' },
  { value: 'wma', label: 'WMA' },
  { value: 'opus', label: 'OPUS' },
  { value: 'alac', label: 'ALAC' },
  { value: 'amr', label: 'AMR' },
];

export const imageFormats: Format[] = [
  { value: 'jpg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'bmp', label: 'BMP' },
  { value: 'tiff', label: 'TIFF' },
  { value: 'gif', label: 'GIF' },
  { value: 'webp', label: 'WebP' },
];

export const subtitleFormats: Format[] = [
  { value: 'srt', label: 'SRT' },
  { value: 'ass', label: 'ASS' },
  { value: 'vtt', label: 'VTT' },
  { value: 'sub', label: 'SUB' },
];

export const specialFormats: Format[] = [
  { value: 'm3u8', label: 'HLS Streaming' },
  { value: 'dash', label: 'MPEG-DASH' },
  { value: 'iso', label: 'DVD Image' },
  { value: 'vob', label: 'DVD Video' },
  { value: 'dv', label: 'DV' },
  { value: 'rm', label: 'RealMedia' },
];
