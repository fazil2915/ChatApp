import { Server } from "socket.io";
import http from "http";
import express from "express";
import { log } from "console";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ["http://localhost:3000"],
		methods: ["GET", "POST"],
		
	},
});

const userSocketMap = {}; // {userId: socketId}
export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};
io.on("connection", (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	console.log(userId);
	if (userId !== undefined) { // Correctly check if userId is undefined
		userSocketMap[userId] = socket.id;
	} else {
		console.warn("User did not provide a valid userId");
	}

	// Efficiently manage event emission
	let onlineUsers = Object.keys(userSocketMap);
	console.log(onlineUsers);
	if (onlineUsers.length > 0) {
	  io.emit("getOnlineUsers", onlineUsers);
	}
  

	socket.on("disconnect", () => {
		console.log("user disconnected", socket.id);
		delete userSocketMap[userId]; // Ensure userId is defined here too
		onlineUsers = Object.keys(userSocketMap);
		if (onlineUsers.length > 0) {
			io.emit("getOnlineUsers", onlineUsers);
		}
	});
});

export { app, io, server };
