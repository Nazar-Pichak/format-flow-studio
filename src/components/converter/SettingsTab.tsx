
import { Settings } from 'lucide-react';

const SettingsTab = () => {
  return (
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Privacy
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          All processing occurs in your browser. Your files are never uploaded to any server.
        </p>
      </div>
    </div>
  );
};

export default SettingsTab;
