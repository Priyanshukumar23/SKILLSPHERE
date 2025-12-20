const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Contest = require('../models/Contest');
const User = require('../models/User');

// @route   GET api/contests
// @desc    Get all contests
// @access  Public (or Private if you prefer)
router.get('/', async (req, res) => {
    try {
        const contests = await Contest.find().sort({ createdAt: -1 });
        res.json(contests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/contests
// @desc    Create a contest
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized. Admin access required.' });
        }

        const { title, description, details, rules, prize, deadline } = req.body;

        const newContest = new Contest({
            title,
            description,
            details,
            rules,
            prize,
            deadline
        });

        const contest = await newContest.save();
        res.json(contest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/contests/:id
// @desc    Delete a contest
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized. Admin access required.' });
        }

        const contest = await Contest.findById(req.params.id);

        if (!contest) {
            return res.status(404).json({ msg: 'Contest not found' });
        }

        await contest.deleteOne();

        res.json({ msg: 'Contest removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Contest not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
