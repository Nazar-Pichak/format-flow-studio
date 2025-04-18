
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import DropZone from './DropZone';
import FormatSelector, { Format } from './FormatSelector';
import ConversionProgress from './ConversionProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Download, Loader2, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Define supported formats
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

const VideoConverter = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionStatus, setConversionStatus] = useState<'idle' | 'converting' | 'completed' | 'error'>('idle');
  const [convertedVideoUrl, setConvertedVideoUrl] = useState<string | null>(null);
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load FFmpeg
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
        
        // Load FFmpeg core
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setFFmpeg(ffmpegInstance);
        setLoading(false);
        console.log('FFmpeg loaded');
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
    
    return () => {
      // Clean up any resources if needed
      setConvertedVideoUrl(null);
    };
  }, [toast]);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setConversionStatus('idle');
    setConversionProgress(0);
    setConvertedVideoUrl(null);
  };

  const handleFormatChange = (format: string) => {
    setOutputFormat(format);
    // Reset conversion if output format changes
    if (conversionStatus === 'completed') {
      setConversionStatus('idle');
      setConversionProgress(0);
      setConvertedVideoUrl(null);
    }
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

      // Write the input file to memory
      const inputFileName = 'input' + getFileExtension(selectedFile.name);
      ffmpeg.writeFile(inputFileName, await fetchFile(selectedFile));

      // Get the output filename
      const outputFileName = `output.${outputFormat}`;

      // Build the FFmpeg command
      const ffmpegCommand = [
        '-i', inputFileName,
        '-c:v', 'libx264', // Use H.264 codec for video
        '-preset', 'medium', // Balance between speed and quality
        '-c:a', 'aac', // Use AAC for audio
        '-strict', 'experimental',
        outputFileName
      ];

      // Run the FFmpeg command
      await ffmpeg.exec(ffmpegCommand);

      // Read the output file
      const outputData = await ffmpeg.readFile(outputFileName);
      const outputBlob = new Blob([outputData], { type: `video/${outputFormat}` });
      const url = URL.createObjectURL(outputBlob);

      setConvertedVideoUrl(url);
      setConversionStatus('completed');
      setConversionProgress(100);

      toast({
        title: 'Success',
        description: 'Video conversion completed successfully!'
      });
    } catch (error) {
      console.error('Conversion error:', error);
      setConversionStatus('error');
      toast({
        variant: 'destructive',
        title: 'Conversion Error',
        description: 'Failed to convert the video. Please try again.'
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Format Flow Studio</CardTitle>
        <CardDescription className="text-center">Convert your videos to any format with ease</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Loading FFmpeg...</p>
              </div>
            ) : (
              <>
                {!selectedFile ? (
                  <DropZone onFileSelected={handleFileSelected} />
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Input File</p>
                        <p className="text-sm text-muted-foreground mb-4">{selectedFile.name}</p>
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedFile(null)}
                          className="w-full"
                        >
                          Change File
                        </Button>
                      </div>
                      <div>
                        <FormatSelector
                          formats={videoFormats}
                          selectedFormat={outputFormat}
                          onFormatChange={handleFormatChange}
                          label="Output Format"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <ConversionProgress 
                        progress={conversionProgress} 
                        status={conversionStatus} 
                      />
                    </div>
                  </>
                )}

                {convertedVideoUrl && (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium">Preview</p>
                    <video 
                      controls 
                      className="w-full rounded-md border" 
                      src={convertedVideoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div className="rounded-md bg-muted/50 p-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Conversion Settings</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Currently using default conversion settings for optimal quality and compatibility.
                  Advanced settings will be available in future updates.
                </p>
              </div>
              
              <div className="rounded-md bg-muted/50 p-4">
                <h3 className="text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Privacy
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  All processing occurs in your browser. Your files are never uploaded to any server.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {selectedFile && (
          <>
            {conversionStatus !== 'converting' && conversionStatus !== 'completed' && (
              <Button 
                disabled={loading || !ffmpeg} 
                onClick={startConversion} 
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                  </>
                ) : (
                  'Start Conversion'
                )}
              </Button>
            )}
            
            {conversionStatus === 'converting' && (
              <Button disabled className="w-full sm:w-auto">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Converting...
              </Button>
            )}
            
            {conversionStatus === 'completed' && (
              <>
                <Button onClick={downloadConvertedFile} className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="outline" onClick={resetConverter} className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Convert Another
                </Button>
              </>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default VideoConverter;
