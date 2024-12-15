const express = require("express");
const router = express.Router();
const Item = require("../entities/Item");
const Review = require("../entities/Review");

router.post('/items', async (req, res) => {
  try {
    const { name, price, image } = req.body;
    const newItem = new Item({
      name,
      price,
      image,
    });
    await newItem.save();
    res.status(201).json({item: newItem });
  } catch (error) {
    console.error(error);
    res.status(500).json();
  }
});

router.get("/items", async (req, res) => {
  try {
    const items = await Item.aggregate([
      {
        $lookup: {
          from: "reviews", 
          localField: "_id",
          foreignField: "itemId",
          as: "reviews",
        },
      },
      {
        $addFields: {
          averageRating: { $avg: "$reviews.rating" },
        },
      },
    ]);

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Get an item by id
router.get("/items/:itemId", async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.itemId }); // Ensure compatibility with string or ObjectId
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.status(200).json(item); // Send the entire item as JSON response
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid Item ID format' });
  }
});

router.patch("/items/:itemId", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.itemId,
      { $set: req.body },
      { new: true } // Return the updated document
    );
    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found." });
    }
    res.status(200).json(updatedItem); // Send the updated item as the response
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid Item ID or update data." });
  }
});



router.get('/items/:itemId/reviews', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const item = await Item.findOne({ _id: itemId }).populate('reviews'); // Use findOne to handle string or ObjectId
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    res.status(200).json({ reviews: item.reviews });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid Item ID format' });
  }
});




router.post('/items/:itemId/reviews', async (req, res) => {
  const { rating, comment } = req.body;
  const itemId = req.params.itemId; // Correct parameter name

  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating.' });
  }

  const item = await Item.findById(itemId); // Check if the item exists
  if (!item) {
    return res.status(404).json({ message: 'Item not foundd.' });
  }

  const newReview = new Review({ rating, comment });
  try {
    const savedReview = await newReview.save(); // Save the new review
    item.reviews.push(savedReview._id); // Add the review ID to the item's reviews array
    await item.save(); // Save the updated item
    res.status(201).json(savedReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete all items
router.delete("/items", async (req, res) => {
  try {
    const removedItems = await Item.deleteMany({});
    res.send(removedItems);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete an item by ID
router.delete("/items/:itemId", async (req, res) => {
  try {
    const removedItem = await Item.findByIdAndRemove(req.params.itemId);
    if (!removedItem) {
      return res.status(404).send("Item not found");
    }
    res.send(removedItem);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
