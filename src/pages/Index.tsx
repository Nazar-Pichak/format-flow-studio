
import { useState } from "react";
import VideoConverter from "@/components/VideoConverter";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<'video' | 'audio' | 'image' | 'subtitle' | 'special'>('video');

  const supportedFormats = {
    video: [
      'MP4', 'AVI', 'MOV', 'MKV',
      'FLV', 'WMV', 'WebM', 'MPEG/MPG',
      '3GP', 'TS', 'M4V'
    ],
    audio: [
      'MP3', 'AAC', 'WAV', 'FLAC',
      'OGG', 'M4A', 'WMA', 'OPUS',
      'ALAC', 'AMR'
    ],
    image: [
      'JPG/JPEG', 'PNG', 'BMP', 'TIFF',
      'GIF', 'WebP'
    ],
    subtitle: [
      'SRT', 'ASS', 'VTT', 'SUB'
    ],
    special: [
      'HLS (M3U8)', 'MPEG-DASH', 'DVD Image (ISO)',
      'DVD Video (VOB)', 'DV', 'RealMedia (RM)'
    ]
  };

  const handleCategoryChange = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-accent/30">
      <header className="container mx-auto pt-8 pb-6 px-4">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Format Flow Studio
        </h1>
        <p className="text-center text-muted-foreground mt-2">
          Convert your files to any format with just a few clicks
        </p>
      </header>
      
      <main className="flex-1 container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto">
          <VideoConverter onCategoryChange={handleCategoryChange} />
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Supported {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Formats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {supportedFormats[selectedCategory].map((format) => (
              <div key={format} className="bg-white rounded-lg shadow p-3 text-center">
                <p className="font-medium">{format}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-primary font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-medium text-lg mb-2">Upload</h3>
                  <p className="text-muted-foreground">Drop your video file or browse to select one from your device</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-primary font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-medium text-lg mb-2">Select Format</h3>
                  <p className="text-muted-foreground">Choose the output format you want to convert your video to</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <span className="text-primary font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-medium text-lg mb-2">Convert & Download</h3>
                  <p className="text-muted-foreground">Start conversion and download your new video file when complete</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Privacy First</h2>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-muted-foreground">
                  All video processing happens directly in your browser using WebAssembly technology.
                  Your files are never uploaded to any server, ensuring complete privacy and security.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-white py-6 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            Format Flow Studio © {new Date().getFullYear()} | Powered by FFmpeg
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
