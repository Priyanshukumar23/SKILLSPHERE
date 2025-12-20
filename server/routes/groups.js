const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const auth = require('../middleware/auth');

// Get all groups
router.get('/', async (req, res) => {
    try {
        const groups = await Group.find().populate('createdBy', 'username');
        res.json(groups);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single group
router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id).populate('createdBy', 'username').populate('members', ['username', 'profilePicture']);
        if (!group) return res.status(404).json({ msg: 'Group not found' });
        res.json(group);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Group not found' });
        res.status(500).send('Server Error');
    }
});

// Create a group
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, category, image } = req.body;
        const newGroup = new Group({
            name,
            description,
            category,
            image,
            createdBy: req.user.id,
            members: [req.user.id]
        });

        const group = await newGroup.save();

        // Add to user's joinedGroups
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedGroups: group._id } });

        res.json(group);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Join a group
router.post('/:id/join', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        // Check if already member
        if (group.members.some(member => member.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Already a member' });
        }

        group.members.push(req.user.id);
        await group.save();

        // Add group to user's joinedGroups
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedGroups: group._id } });

        res.json(group);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Leave a group
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        // Check if member
        if (!group.members.includes(req.user.id)) {
            return res.status(400).json({ msg: 'Not a member of this group' });
        }

        // Remove from group members
        group.members = group.members.filter(memberId => memberId.toString() !== req.user.id);
        await group.save();

        // Remove group from user's joinedGroups
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, { $pull: { joinedGroups: group._id } });

        res.json({ msg: 'Left group successfully', group });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Delete Group
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        await Group.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Group removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Admin: Restrict Group
router.put('/:id/restrict', auth, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ msg: 'Group not found' });

        group.isRestricted = !group.isRestricted; // Toggle
        await group.save();
        res.json(group);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
