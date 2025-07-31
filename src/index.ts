import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Server } from "socket.io"
import { createServer } from 'http';
import { createAdapter } from "@socket.io/redis-streams-adapter";
import routes from './routes/index'
import { setupSocket } from './socket';
// import redis from './config/redis.config';
import { instrument } from "@socket.io/admin-ui"
import prisma from './config/db.config';





const app = express();

const server = createServer(app)

const client_url=process.env.CLIENT_URL || '';

const io = new Server(server, {
    cors: {
        origin: [client_url, "http://192.168.1.4:3000", "https://admin.socket.io"],
        credentials: true,
    },
    // adapter: createAdapter(redis)
})


// admin UI  pannel to see the websocket status
// instrument(io, {
//     auth: false,
//     mode: "development",
// });


// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));


app.use('/api/v1', routes)

const port = process.env.PORT || 8010;


app.get('/', (req: Request, res: Response) => {
    return res.send("It's working 🙌")
})


server.listen(port, () => console.log(`server is running on ${port}`))

// Handle Prisma connection
prisma.$connect()
    .then(() => console.log('Database connected successfully'))
    .catch((err: any) => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

setupSocket(io);
export { io };

