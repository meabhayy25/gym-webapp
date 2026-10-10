import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Upload,
  Link,
  Video,
  Image,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Exercise } from '../types';
import { api } from '../services/api';

interface ExerciseVideoPlayerProps {
  exercise: Exercise;
  onVideoUpdated?: (updated: Exercise) => void;
  allowEdit?: boolean;
}

export const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({
  exercise,
  onVideoUpdated,
  allowEdit = true
}) => {
  const [viewMode, setViewMode] = useState<'video' | 'photo'>(
    exercise.videoUrl ? 'video' : 'photo'
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'samples'>('upload');

  // URL state
  const [customUrl, setCustomUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Upload file state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Helper to format YouTube URLs into embed URLs
  const formatVideoEmbedUrl = (rawUrl: string): { isEmbed: boolean; url: string; isDirect: boolean } => {
    if (!rawUrl) return { isEmbed: false, url: '', isDirect: false };

    // YouTube matches
    const ytMatch = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      return {
        isEmbed: true,
        url: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=1&modestbranding=1&rel=0`,
        isDirect: false
      };
    }

    // Vimeo matches
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch) {
      return {
        isEmbed: true,
        url: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1&loop=1`,
        isDirect: false
      };
    }

    // Direct video file or blob or data URL
    return {
      isEmbed: false,
      url: rawUrl,
      isDirect: true
    };
  };

  const currentVideoParsed = formatVideoEmbedUrl(exercise.videoUrl || '');

  // Handle local video file selection
  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file (.mp4, .webm, .mov, etc.)');
      return;
    }

    setUploadedFile(file);

    // Read as Data URL or Object URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Save Video
  const handleSaveVideo = async (targetVideoUrl: string) => {
    if (!targetVideoUrl) {
      setErrorMsg('Please provide a video link or choose a video file');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const res = await api.updateExerciseVideo(exercise.id, targetVideoUrl);
      if (onVideoUpdated) {
        onVideoUpdated(res.exercise);
      }
      setViewMode('video');
      setShowEditModal(false);
      setToastMsg('Exercise video updated successfully!');
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  // Sample fitness demo clips
  const sampleClips = [
    {
      title: 'YouTube Form Breakdown',
      url: 'https://www.youtube.com/embed/rT7DgCr-3pg',
      tag: 'YouTube Tutorial'
    },
    {
      title: 'Technique Demonstration (HTML5)',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      tag: 'Direct MP4 Loop'
    },
    {
      title: 'Heavy Barbell Lift Loop',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      tag: 'Direct MP4 Loop'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Media Player Container */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-xl group">
        {viewMode === 'video' && exercise.videoUrl ? (
          currentVideoParsed.isEmbed ? (
            /* Embedded Player (YouTube / Vimeo) */
            <iframe
              src={currentVideoParsed.url}
              title={`${exercise.name} Demonstration`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            /* Native HTML5 Video Player */
            <video
              ref={videoRef}
              src={currentVideoParsed.url}
              controls
              playsInline
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
            />
          )
        ) : (
          /* Still Technique Photo View */
          <div className="relative w-full h-full">
            <img
              src={exercise.thumbnail}
              alt={exercise.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            {/* If video exists, show big play button overlay to jump right in */}
            {exercise.videoUrl && (
              <button
                onClick={() => setViewMode('video')}
                className="absolute inset-0 flex items-center justify-center group/btn"
              >
                <div className="w-16 h-16 rounded-full bg-[#FF6B35] flex items-center justify-center text-white shadow-xl shadow-[#FF6B35]/40 group-hover/btn:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Top Control Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          {/* View Mode Toggle: Video vs Still Photo */}
          <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('video')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'video'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video Play</span>
            </button>
            <button
              onClick={() => setViewMode('photo')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'photo'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Still Photo</span>
            </button>
          </div>

          {/* Upload / Change Video Button */}
          {allowEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 bg-black/80 hover:bg-[#FF6B35] text-white backdrop-blur-md rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-1.5 shadow-lg"
              title="Add or change video for this exercise"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add / Change Video</span>
            </button>
          )}
        </div>

        {/* Bottom Metadata Ribbon */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs">
            <span className="font-bold text-[#FF6B35]">{exercise.muscleGroup}</span>
            <span className="text-[#A1A1AA]">·</span>
            <span className="text-white/90">{exercise.equipment}</span>
          </div>

          {exercise.videoUrl && (
            <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-white/80">
              Form Demonstration
            </div>
          )}
        </div>
      </div>

      {/* Edit Video Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-[#15151D] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">
                Video Management
              </span>
              <h3 className="font-display text-xl font-bold text-white mt-0.5">
                Upload or Change Video for {exercise.name}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Upload your own video recording from your device or paste a video link.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 bg-[#1C1C26] p-1 rounded-xl border border-white/5 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Upload Video File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'url'
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Paste Video Link
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('samples')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'samples'
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Sample Clips
              </button>
            </div>

            {/* TAB 1: UPLOAD VIDEO FILE */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#FF6B35] bg-[#FF6B35]/10'
                      : 'border-white/15 bg-[#1C1C26] hover:border-white/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-[#FF6B35] mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">
                    {uploadedFile ? uploadedFile.name : 'Click to select or drag video here'}
                  </p>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Supports MP4, WebM, MOV files from your phone or desktop
                  </p>
                </div>

                {/* Instant Video Preview if file selected */}
                {uploadDataUrl && (
                  <div className="rounded-xl overflow-hidden aspect-video bg-black border border-white/10">
                    <video
                      src={uploadDataUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving || !uploadDataUrl}
                  onClick={() => handleSaveVideo(uploadDataUrl || '')}
                  className="w-full py-3 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md disabled:opacity-50 min-h-[44px]"
                >
                  {saving ? 'Saving Video...' : 'Save & Set as Exercise Video'}
                </button>
              </div>
            )}

            {/* TAB 2: PASTE VIDEO LINK */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5">
                    Video URL (YouTube, Vimeo, or direct MP4 link)
                  </label>
                  <div className="relative">
                    <Link className="w-4 h-4 text-[#A1A1AA] absolute left-3.5 top-3.5" />
                    <input
                      type="url"
                      value={customUrl}
                      onChange={(e) => {
                        setCustomUrl(e.target.value);
                        setPreviewUrl(e.target.value);
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full bg-[#1C1C26] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF6B35]"
                    />
                  </div>
                </div>

                {previewUrl && (
                  <div className="rounded-xl overflow-hidden aspect-video bg-black border border-white/10">
                    {formatVideoEmbedUrl(previewUrl).isEmbed ? (
                      <iframe
                        src={formatVideoEmbedUrl(previewUrl).url}
                        className="w-full h-full border-0"
                        title="Preview"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving || !customUrl}
                  onClick={() => handleSaveVideo(customUrl)}
                  className="w-full py-3 bg-[#FF6B35] hover:bg-[#e05824] text-white font-bold rounded-xl shadow-md disabled:opacity-50 min-h-[44px]"
                >
                  {saving ? 'Saving...' : 'Apply Video Link'}
                </button>
              </div>
            )}

            {/* TAB 3: SAMPLES */}
            {activeTab === 'samples' && (
              <div className="space-y-3">
                <p className="text-xs text-[#A1A1AA]">
                  Pick one of these pre-configured demonstration loops:
                </p>
                <div className="space-y-2">
                  {sampleClips.map((clip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSaveVideo(clip.url)}
                      className="w-full p-3 bg-[#1C1C26] hover:bg-[#252533] border border-white/5 rounded-xl text-left flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <p className="font-bold text-white">{clip.title}</p>
                        <p className="text-[10px] text-[#A1A1AA]">{clip.tag}</p>
                      </div>
                      <span className="text-[#FF6B35] font-bold">Select →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
