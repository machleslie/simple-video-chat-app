"use client";

import { io } from 'socket.io-client';
import Peer from 'simple-peer';

// Create socket connection
const socket = io('http://localhost:3001', {
  transports: ['websocket']
});

// WebRTC connection management
const createPeerConnection = (stream, onTrack) => {
  const peer = new Peer({
    initiator: true, 
    trickle: false, 
    stream: stream
  });

  // Detailed logging for signal events
  peer.on('signal', (data) => {
    socket.emit('webrtc-signal', data);
  });

  // Handle receiving a track
  peer.on('track', (track, stream) => {
    console.log('Remote track received:');
    console.log('Remote stream:');
    onTrack(stream);
  });

  // Handle connection
  peer.on('connect', () => {
    console.log('WebRTC Peer Connection Established');
  });

  // Handle errors
  peer.on('error', (err) => {
    console.error('Peer Connection Error:', err);
  });

  return peer;
};

// Start webcam and set up WebRTC
const startWebcam = async (videoRef, onTrack) => {
  try {
    // Request webcam access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: false 
    });

    // Update local video
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }

    // Set up peer connection
    const peer = createPeerConnection(stream, onTrack);

    // Socket event listeners for signaling
    socket.on('webrtc-signal', (signalData) => {
      // console.log('Received signal data:', JSON.stringify(signalData));
      peer.signal(signalData);
    });

    return { stream, peer };
  } catch (error) {
    console.error("Error accessing webcam:", error);
    throw error;
  }
};

// Initialize connection
const initializeConnection = (peer) => {
  socket.emit('join-room', 'default-room');
};

export { 
  startWebcam, 
  initializeConnection, 
  socket 
};