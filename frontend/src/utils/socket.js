// utils/socket.js
import { io } from 'socket.io-client';

// Create a shared socket instance with the backend server
const socketServerUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000';
const socket = io(socketServerUrl);

export default socket;
