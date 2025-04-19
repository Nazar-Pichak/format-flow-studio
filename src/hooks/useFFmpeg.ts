import { useState, useEffect } from 'react';
import { type FFmpeg } from '@ffmpeg/ffmpeg';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import { useToast } from '@/hooks/use-toast';

export const useFFmpeg = () => {
  const { toast } = useToast();
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setLoading(true);

        const ffmpegInstance = createFFmpeg({
          log: true,
          corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
        });

        await ffmpegInstance.load();

        console.log('FFmpeg loaded successfully');
        setFFmpeg(ffmpegInstance);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load FFmpeg. Please refresh and try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadFFmpeg();
  }, [toast]);

  return { ffmpeg, loading, ready: !!ffmpeg && !loading };
};
