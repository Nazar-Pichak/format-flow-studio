
import { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { useToast } from '@/hooks/use-toast';

export const useFFmpeg = () => {
  const { toast } = useToast();
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setLoading(true);
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on('log', ({ message }) => {
          console.log(message);
        });
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.11.0/dist';
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
        
        await ffmpegInstance.load({
          coreURL,
          wasmURL
        });
        
        console.log('FFmpeg loaded successfully');
        setFFmpeg(ffmpegInstance);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load FFmpeg. Please refresh and try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadFFmpeg();
  }, [toast]);

  return { ffmpeg, loading };
};
