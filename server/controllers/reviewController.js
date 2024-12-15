const express = require('express');
const router = express.Router();
const Review = require('../entities/Review'); 

// GET all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// POST a new review
router.post('/reviews', async (req, res) => {
  const { rating, comment } = req.body;

  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating.' });
  }
  const newReview = new Review({ rating, comment });
  try {
    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
