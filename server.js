import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

//set static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "public")));


const httpServer = createServer(app);
const io = new Server(httpServer);

//run when user connects
io.on("connection", (socket) => {
    console.log("New socket connetion");
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
