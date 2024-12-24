"use client";

import { useRef, useState, useEffect } from 'react';
import { startWebcam, initializeConnection, socket } from '../actions/actions';

export default function VideoClient() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [peer, setPeer] = useState(null);

  useEffect(() => {
    const setupWebRTC = async () => {
      try {
        // Start webcam and create peer connection
        const { stream, peer } = await startWebcam(localVideoRef, (remoteStream) => {
          console.log('Remote Stream Callback Triggered');
          
          // Handle remote stream
          if (remoteVideoRef.current) {
            console.log('Setting remote video source');
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.onloadedmetadata = () => {
              console.log('Remote video metadata loaded');
              remoteVideoRef.current?.play();
            };
          }
        });

        // Save local stream and peer
        setLocalStream(stream);
        setPeer(peer);

        // Initialize connection
        initializeConnection(peer);
      } catch (error) {
        console.error('WebRTC Setup Error:', error);
      }
    };

    setupWebRTC();

    // Cleanup on unmount
    return () => {
      // Close media stream tracks
      localStream?.getTracks().forEach(track => track.stop());
      socket.disconnect();
      peer?.destroy();
    };
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4">
        <div>
          <h2>Local Video</h2>
          <video 
            ref={localVideoRef}
            className="w-96 bg-black"
            autoPlay 
            playsInline 
            muted
          />
        </div>
        <div>
          <h2>Remote Video</h2>
          <video 
            ref={remoteVideoRef}
            className="w-96 bg-black"
            autoPlay 
            playsInline
          />
        </div>
      </div>
    </div>
  );
}