require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const Document = require('./models/Document');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET","POST"] }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

io.on('connection', (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on('get-document', async (docId) => {
    let document = await Document.findById(docId);
    if (!document) {
      document = await Document.create({ _id: docId, data: { ops: [] } });
    }
    socket.join(docId);
    socket.emit('load-document', document.data);

    socket.on('send-changes', (delta) => {
      socket.broadcast.to(docId).emit('receive-changes', delta);
    });

    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(docId, { data });
    });
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
