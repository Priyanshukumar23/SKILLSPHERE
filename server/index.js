const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const http = require('http');
const { Server } = require("socket.io");
const Message = require('./models/Message');
const multer = require('multer');
const Filter = require('bad-words');
const filter = new Filter();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.io Real-time Logic

// Anonymous Chat Users
const chatUsers = {};

// Socket.io Real-time Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // --- Group/Event Logic ---
  socket.on('join_group', (data) => {
    let groupId, username;
    if (typeof data === 'string') {
      groupId = data;
    } else {
      groupId = data.groupId;
      username = data.username;
    }

    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);

    if (username) {
      // Broadcast to others in room
      io.to(groupId).emit('receive_message', {
        type: 'system',
        content: `${username} joined the chat`,
        _id: Date.now() + Math.random() // Ensure unique ID
      });
    }
  });

  socket.on('send_message', async (data) => {
    // data: { groupId, senderId, type, content, pollQuestion, pollOptions }
    try {
      const newMessage = new Message({
        group: data.groupId,
        sender: data.senderId,
        type: data.type,
        content: filter.clean(data.content),
        pollQuestion: data.pollQuestion,
        pollOptions: data.pollOptions
      });
      await newMessage.save();

      // Populate sender info before emitting
      await newMessage.populate('sender', ['username', 'profilePicture']);

      const messageToSend = newMessage.toObject();
      io.to(data.groupId).emit('receive_message', messageToSend);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('vote_poll', async ({ messageId, optionIndex, userId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message && message.type === 'poll') {
        const hasVoted = message.pollOptions.some(opt => opt.votes.includes(userId));
        const option = message.pollOptions[optionIndex];
        const voteIdx = option.votes.indexOf(userId);

        if (voteIdx === -1) {
          option.votes.push(userId);
        } else {
          option.votes.splice(voteIdx, 1);
        }
        await message.save();
        await message.populate('sender', ['username', 'profilePicture']);
        io.to(message.group.toString()).emit('poll_updated', message);
      }
    } catch (err) {
      console.error(err);
    }
  });

  const Message = require('./models/Message');
  const User = require('./models/User');

  // ...

  socket.on('send', async (data) => {
    try {
      let content = filter.clean(data.message);
      // Use provided name/pic or fallback to session
      const senderName = data.name || (chatUsers[socket.id] ? chatUsers[socket.id].name : 'Anonymous');
      const senderPic = data.profilePicture || (chatUsers[socket.id] ? chatUsers[socket.id].profilePicture : null);

      // Check content moderation (blocking)
      if (senderName !== 'Anonymous') {
        const user = await User.findOne({ username: senderName });
        if (user && user.isChatBlocked) {
          content = '****';
        }
      }

      io.emit('receive', {
        message: content,
        name: senderName,
        profilePicture: senderPic
      });
    } catch (err) {
      console.error(err);
    }
  });

  // --- Anonymous Chat Logic ---
  socket.on('new-user-joined', (data) => {
    // data can be string (name) or object { name, profilePicture }
    const name = typeof data === 'object' ? data.name : data;
    const profilePicture = typeof data === 'object' ? data.profilePicture : null;

    chatUsers[socket.id] = { name, profilePicture };
    socket.broadcast.emit('user-joined', { name, profilePicture });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Handle anonymous chat disconnect
    if (chatUsers[socket.id]) {
      socket.broadcast.emit('left', chatUsers[socket.id]);
      delete chatUsers[socket.id];
    }
  });
});


// Basic Route
app.get('/', (req, res) => {
  res.send('Community Platform API is running');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/posts', require('./routes/posts'));
app.use('/uploads', express.static('uploads'));
app.use('/api/events', require('./routes/events'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/users', require('./routes/users'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ msg: 'File Upload Error', error: err.message });
  }
  if (err) {
    // Fix for the specific string error throw in checkFileType
    if (typeof err === 'string') {
      return res.status(400).json({ msg: err });
    }
    return res.status(500).json({ msg: 'Server Error', error: err.message || err });
  }
  next();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
