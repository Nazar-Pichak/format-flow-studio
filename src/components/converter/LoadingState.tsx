
import { LoaderCircle } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg font-medium text-primary">Loading FFmpeg...</p>
      <p className="mt-2 text-sm text-muted-foreground">This may take a few moments</p>
    </div>
  );
};

export default LoadingState;
