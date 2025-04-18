
import { Download, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConverterControlsProps {
  selectedFile: File | null;
  conversionStatus: 'idle' | 'converting' | 'completed' | 'error';
  loading: boolean;
  ffmpeg: any;
  startConversion: () => void;
  downloadConvertedFile: () => void;
  resetConverter: () => void;
}

const ConverterControls = ({
  selectedFile,
  conversionStatus,
  loading,
  ffmpeg,
  startConversion,
  downloadConvertedFile,
  resetConverter
}: ConverterControlsProps) => {
  if (!selectedFile) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
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
    </div>
  );
};

export default ConverterControls;
