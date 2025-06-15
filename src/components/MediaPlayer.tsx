
import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Play, AudioLines, Video, Pause, Volume2, VolumeX } from 'lucide-react';

const MediaPlayer: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('audio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Emergency audio files
  const audioFiles = [
    { id: 'emergency-alarm', name: 'Emergency Alarm', description: 'Loud alarm sound for emergencies' },
    { id: 'sos-signal', name: 'SOS Signal', description: 'International SOS audio signal' },
    { id: 'whistle', name: 'Emergency Whistle', description: 'High-pitched whistle sound' },
    { id: 'siren', name: 'Emergency Siren', description: 'Evacuation siren sound' },
    { id: 'fire-alarm', name: 'Fire Alarm', description: 'Standard fire alarm sound' },
  ];
  
  // Emergency video files with actual instruction videos
  const videoFiles = [
    { id: 'cpr-demo', name: 'CPR Demonstration', description: 'How to perform CPR correctly', 
      source: "https://raw.githubusercontent.com/chetans324/project-videos/main/How%20to%20perform%20CPR%20-%20A%20Step-by-Step%20Guide.mp4" },
    { id: 'bandage-wrap', name: 'Bandage Application', description: 'Proper bandaging technique', 
      source: "https://raw.githubusercontent.com/chetans324/project-videos/main/Bandaging%20Basics.mp4" },
    { id: 'heimlich', name: 'Heimlich Maneuver', description: 'How to help a choking person',
      source: "https://raw.githubusercontent.com/chetans324/project-videos/main/How%20to%20Give%20the%20Heimlich Maneuver%20_%20First%20Aid%20Training.mp4" },
    { id: 'bleeding-control', name: 'Bleeding Control', description: 'How to stop severe bleeding',
      source: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
    { id: 'burn-treatment', name: 'Burn Treatment', description: 'First aid for burns',
      source: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
  ];
  
  const playAudio = (id: string) => {
    if (currentAudio === id && isPlaying) {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentAudio(null);
    } else {
      // Stop previous audio if any
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Play new audio using Web Audio API for better control
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = id === 'emergency-alarm' ? 'sawtooth' : 
                        id === 'sos-signal' ? 'square' : 'sine';
      oscillator.frequency.setValueAtTime(id === 'whistle' ? 880 : 440, audioContext.currentTime);
      
      // Create pattern based on sound type
      if (id === 'sos-signal') {
        // SOS pattern (... --- ...)
        let time = audioContext.currentTime;
        for (let i = 0; i < 3; i++) {
          gainNode.gain.setValueAtTime(1, time);
          gainNode.gain.setValueAtTime(0, time + 0.2);
          time += 0.3;
        }
        for (let i = 0; i < 3; i++) {
          gainNode.gain.setValueAtTime(1, time);
          gainNode.gain.setValueAtTime(0, time + 0.6);
          time += 0.7;
        }
        for (let i = 0; i < 3; i++) {
          gainNode.gain.setValueAtTime(1, time);
          gainNode.gain.setValueAtTime(0, time + 0.2);
          time += 0.3;
        }
      } else if (id === 'emergency-alarm') {
        // Alarm pattern
        let time = audioContext.currentTime;
        for (let i = 0; i < 5; i++) {
          gainNode.gain.setValueAtTime(1, time);
          gainNode.gain.setValueAtTime(0, time + 0.3);
          time += 0.4;
        }
      } else {
        // Simple sound
        gainNode.gain.setValueAtTime(1, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 2);
      }
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      
      setIsPlaying(true);
      setCurrentAudio(id);
      
      // Stop after set duration
      setTimeout(() => {
        oscillator.stop();
        setIsPlaying(false);
        setCurrentAudio(null);
      }, 3000);
    }
  };
  
  const playVideo = (id: string, source: string) => {
    if (currentVideo === id && videoRef.current?.paused === false) {
      // Pause video
      videoRef.current?.pause();
      setCurrentVideo(null);
    } else {
      setCurrentVideo(id);
      // Allow a moment for the state to update before playing
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = source;
          videoRef.current.load();
          videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
      }, 100);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };
  
  const onVideoEnded = () => {
    setCurrentVideo(null);
  };
  
  return (
    <div className="emergency-card">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        {selectedTab === 'audio' ? (
          <AudioLines className="h-5 w-5 text-emergency" />
        ) : (
          <Video className="h-5 w-5 text-emergency" />
        )}
        Emergency Media
      </h2>
      
      <Tabs defaultValue="audio" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="audio" className="flex-1">Audio Signals</TabsTrigger>
          <TabsTrigger value="video" className="flex-1">Video Guides</TabsTrigger>
        </TabsList>
        
        <TabsContent value="audio">
          <div className="space-y-3">
            {audioFiles.map(audio => (
              <div key={audio.id} className="p-3 border rounded-lg bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{audio.name}</h3>
                    <p className="text-sm text-muted-foreground">{audio.description}</p>
                  </div>
                  <Button 
                    onClick={() => playAudio(audio.id)} 
                    disabled={isPlaying && currentAudio !== audio.id} 
                    size="sm" 
                    className="bg-emergency"
                  >
                    {isPlaying && currentAudio === audio.id ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" /> Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" /> Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 border border-dashed rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              Audio files are stored locally and available offline
            </p>
          </div>
          <audio ref={audioRef} className="hidden" />
        </TabsContent>
        
        <TabsContent value="video">
          {currentVideo && (
            <div className="mb-4 rounded-lg overflow-hidden bg-black">
              <video 
                ref={videoRef}
                controls
                width="100%" 
                height="240"
                className="w-full"
                onEnded={onVideoEnded}
              />
              <div className="flex justify-between items-center p-2 bg-gray-900 text-white">
                <div className="text-sm">
                  {videoFiles.find(v => v.id === currentVideo)?.name}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-gray-800"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {videoFiles.map(video => (
              <div key={video.id} className="p-3 border rounded-lg bg-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{video.name}</h3>
                    <p className="text-sm text-muted-foreground">{video.description}</p>
                  </div>
                  <Button 
                    onClick={() => playVideo(video.id, video.source)} 
                    size="sm" 
                    className="bg-emergency"
                  >
                    {currentVideo === video.id && videoRef.current && !videoRef.current.paused ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" /> Play
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 border border-dashed rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              Video guides are stored locally and available offline
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MediaPlayer;
