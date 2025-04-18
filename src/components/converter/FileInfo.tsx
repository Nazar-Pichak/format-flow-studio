
import { Button } from '@/components/ui/button';
import FormatSelector, { Format } from '../FormatSelector';

interface FileInfoProps {
  file: File;
  outputFormat: string;
  formats: Format[];
  onFormatChange: (format: string) => void;
  onFileChange: () => void;
}

const FileInfo = ({
  file,
  outputFormat,
  formats,
  onFormatChange,
  onFileChange
}: FileInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <p className="text-sm font-medium mb-1">Input File</p>
        <p className="text-sm text-muted-foreground mb-4">{file.name}</p>
        <Button 
          variant="outline" 
          onClick={onFileChange}
          className="w-full"
        >
          Change File
        </Button>
      </div>
      <div>
        <FormatSelector
          formats={formats}
          selectedFormat={outputFormat}
          onFormatChange={onFormatChange}
          label="Output Format"
        />
      </div>
    </div>
  );
};

export default FileInfo;
