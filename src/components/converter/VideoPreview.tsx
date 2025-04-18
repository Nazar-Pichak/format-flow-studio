
interface VideoPreviewProps {
  url: string | null;
}

const VideoPreview = ({ url }: VideoPreviewProps) => {
  if (!url) return null;

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm font-medium">Preview</p>
      <video 
        controls 
        className="w-full rounded-md border" 
        src={url}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPreview;
