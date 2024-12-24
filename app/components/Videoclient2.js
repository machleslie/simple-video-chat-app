"use client";

import { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import ClientButtons from './ClientButtons';

export default function Videoclient2() {
    const client2ref = useRef(null);
    const clientButtonsRef = useRef(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to your Socket.IO server
        const newSocket = io('http://localhost:3001', {
            transports: ['websocket']
        });

        setSocket(newSocket);

        // Socket event listeners
        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        newSocket.on('offer', async (offer) => {
            // Handle incoming offer from another peer
            const peerConnection = clientButtonsRef.current?.getPeerConnection();
            if (peerConnection) {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);
                    
                    // Send answer back to the signaling server
                    newSocket.emit('answer', answer);
                } catch (error) {
                    console.error('Error handling offer:', error);
                }
            }
        });

        newSocket.on('answer', async (answer) => {
            // Handle incoming answer from another peer
            const peerConnection = clientButtonsRef.current?.getPeerConnection();
            if (peerConnection) {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (error) {
                    console.error('Error handling answer:', error);
                }
            }
        });

        newSocket.on('ice-candidate', async (candidate) => {
            // Handle incoming ICE candidates
            const peerConnection = clientButtonsRef.current?.getPeerConnection();
            if (peerConnection) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('Error adding ICE candidate:', error);
                }
            }
        });

        // Cleanup on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleWebcamStart = (stream) => {
        // Optional: Handle local video stream if needed
        console.log('Local stream started', stream);
    };

    const handleRemoteTrack = (event) => {
        if (client2ref.current) {
            client2ref.current.srcObject = event.streams[0];
        }
    };

    const handleCreateOffer = async () => {
        const peerConnection = clientButtonsRef.current?.getPeerConnection();
        if (peerConnection && socket) {
            try {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                
                // Send offer to the signaling server
                socket.emit('offer', offer);
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        }
    };

    // Add ICE candidate handling
    const setupPeerConnectionListeners = (peerConnection) => {
        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket) {
                // Send ICE candidate to the signaling server
                socket.emit('ice-candidate', event.candidate);
            }
        };
    };

    return (
        <div>
            <div>
                <video
                    ref={client2ref}
                    className="client2 bg-black w-96"
                    autoPlay
                    playsInline
                />
            </div>
            <ClientButtons 
                ref={clientButtonsRef}
                onWebcamStart={handleWebcamStart}
                onRemoteTrack={handleRemoteTrack}
            />
            <button 
                onClick={handleCreateOffer}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                Initiate Connection
            </button>
        </div>
    );
}