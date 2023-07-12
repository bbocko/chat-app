import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import knex from "knex";

const connection = {
    client: "pg",
    connection: {
        host: "localhost",
        user: "blaz",
        password: "chatapp123",
        database: "chat-app-db"
    }
};

const db = knex(connection);

const app = express();

// set static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "public")));

// create new server with socket.io
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());

// API to get all chat rooms
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await db('chat_rooms').select('id', 'name');
        res.json(rooms);
    } catch (error) {
        console.error('Error getting chat rooms:', error);
        res.status(500).json({ message: 'Failed to get chat rooms' });
    }
});

// API for creating new room
app.post('/api/rooms', async (req, res) => {
    const { roomName } = req.body;

    // Validate the roomName field
    if (!roomName) {
        return res.status(400).json({ message: 'Room name is required' });
    }

    try {
        const newRoom = await db('chat_rooms')
            .insert({ name: roomName })
            .returning('*');

        // emit the new room to connected clients
        io.emit('newRoom', newRoom[0]);

        res.status(201).json(newRoom);

    } catch (error) {
        console.error('Error creating new room:', error);
        res.status(500).json({ message: 'Failed to create new room' });
    }
});

// run when user connects
io.on("connection", (socket) => {
    //send greetings message to user
    socket.emit("message", "Welcome to #Room 1");
    //broadcast to other when user connects
    socket.broadcast.emit("message", "A user has joined the chat");

    //broadcast to other when user disconnects
    socket.on("disconnect", () => {
        socket.broadcast.emit("message", "A user has left the chat");
    })
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
