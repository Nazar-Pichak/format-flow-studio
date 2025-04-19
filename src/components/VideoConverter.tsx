import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoaderCircle } from 'lucide-react';
import DropZone from './DropZone';
import FileInfo from './converter/FileInfo';
import VideoPreview from './converter/VideoPreview';
import ConverterControls from './converter/ConverterControls';
import SettingsTab from './converter/SettingsTab';
import ConversionProgress from './ConversionProgress';
import { getFFmpegCommandsByCategory, isValidFileType } from '@/utils/conversionService';

const videoFormats: Format[] = [
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

const audioFormats: Format[] = [
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

const imageFormats: Format[] = [
  { value: 'jpg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'bmp', label: 'BMP' },
  { value: 'tiff', label: 'TIFF' },
  { value: 'gif', label: 'GIF' },
  { value: 'webp', label: 'WebP' },
];

const subtitleFormats: Format[] = [
  { value: 'srt', label: 'SRT' },
  { value: 'ass', label: 'ASS' },
  { value: 'vtt', label: 'VTT' },
  { value: 'sub', label: 'SUB' },
];

const specialFormats: Format[] = [
  { value: 'm3u8', label: 'HLS Streaming' },
  { value: 'dash', label: 'MPEG-DASH' },
  { value: 'iso', label: 'DVD Image' },
  { value: 'vob', label: 'DVD Video' },
  { value: 'dv', label: 'DV' },
  { value: 'rm', label: 'RealMedia' },
];

export interface Format {
  value: string;
  label: string;
}

interface VideoConverterProps {
  onCategoryChange: (category: 'video' | 'audio' | 'image' | 'subtitle' | 'special') => void;
}

const VideoConverter = ({ onCategoryChange }: VideoConverterProps) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'completed' | 'error'>('idle');
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'video' | 'audio' | 'image' | 'subtitle' | 'special'>('video');

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        setLoading(true);
        const ffmpegInstance = new FFmpeg();
        
        ffmpegInstance.on('log', ({ message }) => {
          console.log(message);
        });
        
        ffmpegInstance.on('progress', ({ progress }) => {
          setConversionProgress(Math.round(progress * 100));
        });
        
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setFFmpeg(ffmpegInstance);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        setLoading(false);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load FFmpeg. Please refresh and try again.'
        });
      }
    };
    
    loadFFmpeg();
  }, [toast]);

  const handleFileSelected = (file: File) => {
    if (!isValidFileType(file, selectedCategory)) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: `Please select a valid ${selectedCategory} file.`
      });
      return;
    }
    setSelectedFile(file);
    setConversionStatus('idle');
    setConversionProgress(0);
    setConvertedVideoUrl(null);
  };

  const startConversion = async () => {
    if (!selectedFile || !ffmpeg) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a file and ensure FFmpeg is loaded.'
      });
      return;
    }

    try {
      setConversionStatus('converting');
      setConversionProgress(0);

      const inputFileName = `input${getFileExtension(selectedFile.name)}`;
      const outputFileName = `output.${outputFormat}`;
      
      await ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      const commands = getFFmpegCommandsByCategory(inputFileName, outputFileName, selectedCategory);
      await ffmpeg.exec(commands);

      const outputData = await ffmpeg.readFile(outputFileName);
      const outputBlob = new Blob([outputData], { type: `${selectedCategory}/${outputFormat}` });
      const url = URL.createObjectURL(outputBlob);

      setConvertedVideoUrl(url);
      setConversionStatus('completed');
      setConversionProgress(100);

      toast({
        title: 'Success',
        description: 'File conversion completed successfully!'
      });
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionStatus('error');
      toast({
        variant: 'destructive',
        title: 'Conversion Error',
        description: 'Failed to convert the file. Please try again.'
      });
    }
  };

  const getFileExtension = (filename: string) => {
    return '.' + filename.split('.').pop();
  };

  const resetConverter = () => {
    setSelectedFile(null);
    setConversionStatus('idle');
    setConversionProgress(0);
    setConvertedVideoUrl(null);
  };

  const downloadConvertedFile = () => {
    if (!convertedVideoUrl) return;
    
    const a = document.createElement('a');
    a.href = convertedVideoUrl;
    a.download = `converted.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getCurrentFormats = () => {
    switch(selectedCategory) {
      case 'video': return videoFormats;
      case 'audio': return audioFormats;
      case 'image': return imageFormats;
      case 'subtitle': return subtitleFormats;
      case 'special': return specialFormats;
      default: return videoFormats;
    }
  };

  const handleFormatChange = (format: string) => {
    setOutputFormat(format);
    if (conversionStatus === 'completed') {
      setConversionStatus('idle');
      setConversionProgress(0);
      setConvertedVideoUrl(null);
    }
  };

  const handleCategoryChange = (category: 'video' | 'audio' | 'image' | 'subtitle' | 'special') => {
    setSelectedCategory(category);
    setSelectedFile(null);
    setConversionStatus('idle');
    setConversionProgress(0);
    setConvertedVideoUrl(null);
    onCategoryChange(category);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Format Flow Studio</CardTitle>
        <CardDescription className="text-center">Convert your files to any format with ease</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="video" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="video" onClick={() => handleCategoryChange('video')}>Video</TabsTrigger>
            <TabsTrigger value="audio" onClick={() => handleCategoryChange('audio')}>Audio</TabsTrigger>
            <TabsTrigger value="image" onClick={() => handleCategoryChange('image')}>Image</TabsTrigger>
            <TabsTrigger value="subtitle" onClick={() => handleCategoryChange('subtitle')}>Subtitle</TabsTrigger>
            <TabsTrigger value="special" onClick={() => handleCategoryChange('special')}>Special</TabsTrigger>
          </TabsList>
          
          <TabsContent value="video" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-primary">Loading FFmpeg...</p>
                <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            ) : (
              <>
                {!selectedFile ? (
                  <DropZone onFileSelected={handleFileSelected} category={selectedCategory} />
                ) : (
                  <>
                    <FileInfo
                      file={selectedFile}
                      outputFormat={outputFormat}
                      formats={getCurrentFormats()}
                      onFormatChange={handleFormatChange}
                      onFileChange={() => setSelectedFile(null)}
                    />
                    <div className="mt-6">
                      <ConversionProgress 
                        progress={conversionProgress} 
                        status={conversionStatus} 
                      />
                    </div>
                  </>
                )}
                <VideoPreview url={convertedVideoUrl} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-primary">Loading FFmpeg...</p>
                <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            ) : (
              <>
                {!selectedFile ? (
                  <DropZone onFileSelected={handleFileSelected} category={selectedCategory} />
                ) : (
                  <>
                    <FileInfo
                      file={selectedFile}
                      outputFormat={outputFormat}
                      formats={getCurrentFormats()}
                      onFormatChange={handleFormatChange}
                      onFileChange={() => setSelectedFile(null)}
                    />
                    <div className="mt-6">
                      <ConversionProgress 
                        progress={conversionProgress} 
                        status={conversionStatus} 
                      />
                    </div>
                  </>
                )}
                <VideoPreview url={convertedVideoUrl} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-primary">Loading FFmpeg...</p>
                <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            ) : (
              <>
                {!selectedFile ? (
                  <DropZone onFileSelected={handleFileSelected} category={selectedCategory} />
                ) : (
                  <>
                    <FileInfo
                      file={selectedFile}
                      outputFormat={outputFormat}
                      formats={getCurrentFormats()}
                      onFormatChange={handleFormatChange}
                      onFileChange={() => setSelectedFile(null)}
                    />
                    <div className="mt-6">
                      <ConversionProgress 
                        progress={conversionProgress} 
                        status={conversionStatus} 
                      />
                    </div>
                  </>
                )}
                <VideoPreview url={convertedVideoUrl} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="subtitle" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-primary">Loading FFmpeg...</p>
                <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            ) : (
              <>
                {!selectedFile ? (
                  <DropZone onFileSelected={handleFileSelected} category={selectedCategory} />
                ) : (
                  <>
                    <FileInfo
                      file={selectedFile}
                      outputFormat={outputFormat}
                      formats={getCurrentFormats()}
                      onFormatChange={handleFormatChange}
                      onFileChange={() => setSelectedFile(null)}
                    />
                    <div className="mt-6">
                      <ConversionProgress 
                        progress={conversionProgress} 
                        status={conversionStatus} 
                      />
                    </div>
                  </>
                )}
                <VideoPreview url={convertedVideoUrl} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="special" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-lg font-medium text-primary">Loading FFmpeg...</p>
                <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            ) : (
              <>
                {!selectedFile ? (
                  <DropZone onFileSelected={handleFileSelected} category={selectedCategory} />
                ) : (
                  <>
                    <FileInfo
                      file={selectedFile}
                      outputFormat={outputFormat}
                      formats={getCurrentFormats()}
                      onFormatChange={handleFormatChange}
                      onFileChange={() => setSelectedFile(null)}
                    />
                    <div className="mt-6">
                      <ConversionProgress 
                        progress={conversionProgress} 
                        status={conversionStatus} 
                      />
                    </div>
                  </>
                )}
                <VideoPreview url={convertedVideoUrl} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <ConverterControls
          selectedFile={selectedFile}
          conversionStatus={conversionStatus}
          loading={loading}
          ffmpeg={ffmpeg}
          startConversion={startConversion}
          downloadConvertedFile={downloadConvertedFile}
          resetConverter={resetConverter}
        />
      </CardFooter>
    </Card>
  );
};

export default VideoConverter;
