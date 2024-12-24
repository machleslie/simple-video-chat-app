const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track rooms and connections
const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle room join
  socket.on('join-room', (roomId) => {
    console.log(`Client ${socket.id} joining room: ${roomId}`);

    // Join the room
    socket.join(roomId);

    // If room doesn't exist, create it
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    // Add socket to room participants
    rooms[roomId].push(socket.id);

    // Broadcast to other clients in the room
    socket.to(roomId).emit('user-connected', socket.id);
  });

  // WebRTC signaling
  socket.on('webrtc-signal', (signalData) => {
    console.log(`Received WebRTC signal from ${socket.id}:`, JSON.stringify(signalData));
    
    // Broadcast signal to all other clients in the same room
    socket.broadcast.emit('webrtc-signal', signalData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove socket from rooms
    Object.keys(rooms).forEach(roomId => {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});