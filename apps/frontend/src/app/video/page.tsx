import { VideoPlayer } from "../../components/VideoPlayer/VideoPlayer";

export default function VideoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg">
        <VideoPlayer watermark="Video Coder" />
      </div>
    </div>
  );
}