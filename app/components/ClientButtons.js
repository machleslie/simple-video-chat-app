"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const createPeerConnection = (onTrack) => {
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const pc = new RTCPeerConnection(configuration);

  // ICE candidate handling
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("New ICE Candidate:", JSON.stringify(event.candidate));
      // In a real app, you'd send this to the remote peer
    }
  };

  // Track handling
  pc.ontrack = (event) => {
    onTrack(event);
  };

  // Connection state tracking
  pc.onconnectionstatechange = () => {
    console.log('Connection state:', {
      signalingState: pc.signalingState,
      connectionState: pc.connectionState,
      iceConnectionState: pc.iceConnectionState
    });

    if (pc.connectionState === 'failed') {
      console.warn('Connection failed, recreating peer connection');
      pc.close();
    }
  };

  return pc;
};

const ClientButtons = forwardRef(function ClientButtons({ onWebcamStart, onRemoteTrack }, ref) {
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");
  const peerConnectionRef = useRef(null);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getPeerConnection: () => peerConnectionRef.current,
  }));

  // Initialize peer connection
  const initializePeerConnection = () => {
    // Close existing connection if it exists
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = createPeerConnection((event) => {
      console.log('Remote track received:', event);
      onRemoteTrack(event);
    });

    peerConnectionRef.current = pc;
    return pc;
  };

  // Start webcam and add tracks
  const startWebcam = async () => {
    try {
      const pc = peerConnectionRef.current || initializePeerConnection();
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      onWebcamStart(stream);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // Create offer
  const handleCreateOffer = async () => {
    try {
      const pc = peerConnectionRef.current || initializePeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      setOffer(JSON.stringify(offer));
      return offer;
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  // Create answer
  const handleCreateAnswer = async () => {
    try {
      const pc = peerConnectionRef.current || initializePeerConnection();
      const parsedOffer = JSON.parse(offer);
      
      await pc.setRemoteDescription(new RTCSessionDescription(parsedOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      setAnswer(JSON.stringify(answer));
      return answer;
    } catch (error) {
      console.error("Error creating answer:", error);
    }
  };

  // Add answer
  const handleAddAnswer = async () => {
    try {
      const pc = peerConnectionRef.current || initializePeerConnection();
      const parsedAnswer = JSON.parse(answer);
      
      await pc.setRemoteDescription(new RTCSessionDescription(parsedAnswer));
    } catch (error) {
      console.error("Error adding answer:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 items-center sm:flex-row">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={startWebcam}
        >
          Start Webcam
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateOffer}
        >
          Create Offer
        </button>
      </div>

      <div className="flex flex-col gap-4 items-center sm:flex-row">
        <textarea
          className="border border-gray-400 rounded-md p-2 w-full"
          value={offer}
          placeholder="Offer will appear here"
          // readOnly
          onChange={(e) => setOffer(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4 items-center sm:flex-row">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleCreateAnswer}
        >
          Create Answer
        </button>
        <textarea
          className="border border-gray-400 rounded-md p-2 w-full"
          value={answer}
          placeholder="Answer will appear here"
          readOnly
        />
      </div>

      <div className="flex flex-col gap-4 items-center sm:flex-row">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAddAnswer}
        >
          Add Answer
        </button>
      </div>
    </div>
  );
});

export default ClientButtons;