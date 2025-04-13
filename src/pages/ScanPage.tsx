import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { MicIcon, StopCircleIcon, ListIcon, ChevronLeftIcon, Loader2Icon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ScanPage = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState<number | null>(null);
  const [issueType, setIssueType] = useState<string | undefined>();
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      error => {
        console.error("Error getting location:", error);
        toast.error("Couldn't get your location. Please enable location services.");
      }
    );

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      setIsScanning(true);
      
      analyzeAudio();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Couldn't access your microphone. Please check permissions.");
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current || !isScanning) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const avg = sum / bufferLength;
    
    const dB = Math.round((avg / 256) * 100);
    setNoiseLevel(dB);
    
    requestAnimationFrame(analyzeAudio);
  };

  const stopScanning = () => {
    setIsScanning(false);
    
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const submitReport = async () => {
    if (!location || !noiseLevel || !issueType) {
      toast.error("Please select an issue type before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('environmental_reports')
        .insert({
          type: issueType,
          level: noiseLevel,
          lat: location.lat,
          lng: location.lng,
          description: noiseLevel ? `Noise level: ${noiseLevel} dB` : null
        });

      if (error) throw error;

      toast.success("Environmental report submitted!");
      
      setNoiseLevel(null);
      setIssueType(undefined);
      
      setTimeout(() => navigate('/map'), 1000);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNoiseLevelDescription = (level: number | null) => {
    if (level === null) return "Not measuring";
    if (level < 30) return "Low";
    if (level < 70) return "Moderate";
    return "High";
  };

  const getNoiseLevelColor = (level: number | null) => {
    if (level === null) return "bg-gray-300";
    if (level < 30) return "bg-green-500";
    if (level < 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="max-w-md mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon className="mr-1 h-4 w-4" /> Back
        </Button>
        
        <h1 className="text-2xl font-bold mb-6 text-center">Environmental Scanner</h1>
        
        <Card className="mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {isScanning && (
                  <div className="absolute inset-0 rounded-full animate-pulse-ring bg-primary opacity-25"></div>
                )}
                <div className={`w-full h-full rounded-full flex items-center justify-center ${isScanning ? 'bg-eco-green' : 'bg-gray-200'}`}>
                  {isScanning ? (
                    <StopCircleIcon
                      className="h-12 w-12 text-white cursor-pointer"
                      onClick={stopScanning}
                    />
                  ) : (
                    <MicIcon
                      className="h-12 w-12 text-gray-600 cursor-pointer"
                      onClick={startScanning}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 mb-2">Noise Level</p>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getNoiseLevelColor(noiseLevel)}`}></div>
                <p className="text-xl font-semibold">
                  {noiseLevel !== null ? `${noiseLevel} dB` : "Not measuring"}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {getNoiseLevelDescription(noiseLevel)}
              </p>
            </div>
            
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center">
                <ListIcon className="mr-2 h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Issue Type</span>
              </div>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noise">Noise</SelectItem>
                  <SelectItem value="smoke">Smoke</SelectItem>
                  <SelectItem value="garbage">Garbage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-center">
          <Button 
            onClick={submitReport}
            disabled={!noiseLevel || !issueType || !location || isSubmitting}
            className="w-full py-6 text-lg bg-eco-blue hover:bg-blue-600"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
        
        {!location && (
          <div className="flex items-center justify-center mt-4 text-amber-600">
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            <span className="text-sm">Getting your location...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage;
