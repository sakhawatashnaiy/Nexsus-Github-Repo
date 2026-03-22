import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
export function initSignalingServer(httpServer) {
    const origins = env.CORS_ORIGIN.split(',').map((s) => s.trim());
    const io = new Server(httpServer, {
        cors: {
            origin: origins,
            credentials: true,
        },
    });
    io.on('connection', (socket) => {
        socket.on('room:join', async (payload, ack) => {
            const roomId = payload?.roomId?.trim();
            if (!roomId)
                return;
            const room = io.sockets.adapter.rooms.get(roomId);
            const participantsBefore = room?.size ?? 0;
            await socket.join(roomId);
            const roomAfter = io.sockets.adapter.rooms.get(roomId);
            const participants = roomAfter?.size ?? 1;
            const isInitiator = participantsBefore >= 1;
            ack?.({ participants, isInitiator });
            socket.to(roomId).emit('room:peer-joined', { socketId: socket.id });
            io.to(roomId).emit('room:participants', { participants });
        });
        socket.on('room:leave', async (payload) => {
            const roomId = payload?.roomId?.trim();
            if (!roomId)
                return;
            await socket.leave(roomId);
            socket.to(roomId).emit('room:peer-left', { socketId: socket.id });
            const roomAfter = io.sockets.adapter.rooms.get(roomId);
            io.to(roomId).emit('room:participants', { participants: roomAfter?.size ?? 0 });
        });
        socket.on('webrtc:offer', (payload) => {
            const roomId = payload?.roomId?.trim();
            if (!roomId)
                return;
            socket.to(roomId).emit('webrtc:offer', { from: socket.id, sdp: payload.sdp });
        });
        socket.on('webrtc:answer', (payload) => {
            const roomId = payload?.roomId?.trim();
            if (!roomId)
                return;
            socket.to(roomId).emit('webrtc:answer', { from: socket.id, sdp: payload.sdp });
        });
        socket.on('webrtc:ice-candidate', (payload) => {
            const roomId = payload?.roomId?.trim();
            if (!roomId)
                return;
            socket.to(roomId).emit('webrtc:ice-candidate', { from: socket.id, candidate: payload.candidate });
        });
        socket.on('disconnecting', () => {
            for (const roomId of socket.rooms) {
                if (roomId === socket.id)
                    continue;
                socket.to(roomId).emit('room:peer-left', { socketId: socket.id });
                const roomAfter = io.sockets.adapter.rooms.get(roomId);
                io.to(roomId).emit('room:participants', { participants: roomAfter ? roomAfter.size - 1 : 0 });
            }
        });
    });
    logger.info('Signaling server initialized');
    return io;
}
