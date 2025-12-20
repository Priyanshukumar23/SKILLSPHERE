const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    interests: [{ type: String }],
    joinedGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicture: { type: String, default: '' }, // URL/Path to locally stored image
    isChatBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', UserSchema);
