
import { ConversionStatus, FileCategory } from '@/types/converter';
import LoadingState from './LoadingState';
import DropZone from '../DropZone';
import FileInfo from './FileInfo';
import ConversionProgress from '../ConversionProgress';
import { Format } from '@/types/converter';

interface TabContentProps {
  loading: boolean;
  selectedFile: File | null;
  outputFormat: string;
  formats: Format[];
  conversionProgress: number;
  conversionStatus: ConversionStatus;
  convertedUrl: string | null;
  category: FileCategory;
  onFileSelected: (file: File) => void;
  onFormatChange: (format: string) => void;
}

const TabContent = ({
  loading,
  selectedFile,
  outputFormat,
  formats,
  conversionProgress,
  conversionStatus,
  convertedUrl,
  category,
  onFileSelected,
  onFormatChange,
}: TabContentProps) => {
  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      {!selectedFile ? (
        <DropZone onFileSelected={onFileSelected} category={category} />
      ) : (
        <>
          <FileInfo
            file={selectedFile}
            outputFormat={outputFormat}
            formats={formats}
            onFormatChange={onFormatChange}
            onFileChange={() => onFileSelected(null)}
          />
          <div className="mt-6">
            <ConversionProgress 
              progress={conversionProgress} 
              status={conversionStatus} 
            />
          </div>
        </>
      )}
    </>
  );
};

export default TabContent;
