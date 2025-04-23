
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchFile } from '@ffmpeg/util';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConverterControls from './converter/ConverterControls';
import TabContent from './converter/TabContent';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { isValidFileType, getFFmpegCommandsByCategory } from '@/utils/conversionService';
import { FileCategory, ConversionStatus, Format, videoFormats, audioFormats, imageFormats, subtitleFormats, specialFormats } from '@/types/converter';

interface ConverterProps {
  onCategoryChange: (category: FileCategory) => void;
}

const Converter = ({ onCategoryChange }: ConverterProps) => {
  const { toast } = useToast();
  const { ffmpeg, loading } = useFFmpeg();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>('idle');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('video');


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
    setConvertedUrl(null);
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
      console.log(inputFileName);
      const outputFileName = `output.${outputFormat}`;

      // ✅ Fix: Correctly write to FFmpeg's virtual filesystem
      await ffmpeg.FS('writeFile', inputFileName, await fetchFile(selectedFile));

      const commands = getFFmpegCommandsByCategory(inputFileName, outputFileName, selectedCategory);
      await ffmpeg.run(...commands);
      
      const outputData = await ffmpeg.FS('readFile', outputFileName);
      const outputBlob = new Blob([outputData], { type: `${selectedCategory}/${outputFormat}` });
      const url = URL.createObjectURL(outputBlob);

      setConvertedUrl(url);
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
    setConvertedUrl(null);
  };

  const downloadConvertedFile = () => {
    if (!convertedUrl) return;

    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = `converted.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getCurrentFormats = (): Format[] => {
    switch (selectedCategory) {
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
      setConvertedUrl(null);
    }
  };

  const handleCategoryChange = (category: FileCategory) => {
    setSelectedCategory(category);
    setSelectedFile(null);
    setConversionStatus('idle');
    setConversionProgress(0);
    setConvertedUrl(null);
    onCategoryChange(category);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Format Flow Studio</CardTitle>
        <CardDescription className="text-center">Convert your media files with ease</CardDescription>
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

          {['video', 'audio', 'image', 'subtitle', 'special'].map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <TabContent
                loading={loading}
                selectedFile={selectedFile}
                outputFormat={outputFormat}
                formats={getCurrentFormats()}
                conversionProgress={conversionProgress}
                conversionStatus={conversionStatus}
                convertedUrl={convertedUrl}
                category={category as FileCategory}
                onFileSelected={handleFileSelected}
                onFormatChange={handleFormatChange}
              />
            </TabsContent>
          ))}
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

export default Converter;
