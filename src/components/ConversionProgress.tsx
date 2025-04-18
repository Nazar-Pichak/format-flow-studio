
import { Progress } from "@/components/ui/progress";

interface ConversionProgressProps {
  progress: number;
  status: 'idle' | 'converting' | 'completed' | 'error';
}

const ConversionProgress: React.FC<ConversionProgressProps> = ({ progress, status }) => {
  const getStatusText = () => {
    switch(status) {
      case 'idle':
        return 'Waiting to start conversion...';
      case 'converting':
        return `Converting: ${progress}% complete`;
      case 'completed':
        return 'Conversion complete!';
      case 'error':
        return 'Error during conversion';
      default:
        return '';
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{getStatusText()}</p>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};

export default ConversionProgress;
