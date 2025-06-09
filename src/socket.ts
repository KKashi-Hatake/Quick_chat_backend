import { Server, Socket } from "socket.io"
import prisma from "./config/db.config";



interface CustomSocket extends Socket {
    room?: string
}

export function setupSocket(io: Server) {
    console.log("from socket setup");
    io.use((socket: CustomSocket, next) => {
        const room = socket.handshake.auth.room || socket.handshake.headers.room;
        if (!room) {
            return next(new Error('Invalid room, Please pass correct room id'))
        }
        socket.room = room;
        next();
    })


    io.on("connection", (socket: CustomSocket) => {
        console.log("Client connected", socket.id);
        socket.join(socket.room!)

        socket.on("message", async (data) => {
            console.log("Server side message", data);
            // socket.broadcast.emit("message", data);
            await prisma.chats.create({
                data:data
            })
            socket.to(socket?.room!).emit('message', data)
        })

        socket.on("disconnect", () => {
            console.log("A user got disconnected", socket.id)
        })
    })
}