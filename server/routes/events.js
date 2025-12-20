const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get events for a group
router.get('/group/:groupId', async (req, res) => {
    try {
        const events = await Event.find({ group: req.params.groupId });
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create an event
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, date, location, groupId } = req.body;
        const newEvent = new Event({
            title,
            description,
            date,
            location,
            group: groupId
        });

        const event = await newEvent.save();
        res.json(event);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
