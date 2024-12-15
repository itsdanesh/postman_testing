const express = require("express");
const router = express.Router();
const Order = require("../entities/Order");
const Item = require("../entities/Item");

// Create a new order
router.post("/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    const validationError = order.validateSync();
    if (validationError) {
      return res.status(400).send({ error: validationError.message });
    }
    const savedOrder = await order.save();
    res.status(201).send({order:savedOrder}); 
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send({ error: "An error occurred while creating the order." });
  }
});


// Get all orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate('items');
    res.send(orders);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get an order by id
router.get("/orders/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items');
    res.send(order);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update an order by id (edit only title, date, and items)
router.put("/orders/:orderId", async (req, res) => {
  try {
    // Extract only the allowed fields from the request body
    const { title, date, items } = req.body;

    // Find and update the order, returning the updated document
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: { title, date, items } },
      { new: true } // Returns the updated document
    );

    if (!updatedOrder) {
      return res.status(404).send({ message: "Order not found" });
    }

    res.send(updatedOrder);
  } catch (err) {
    res.status(400).send(err);
  }
});


// Create a new item for a specific order
router.post("/orders/:orderId/items", async (req, res) => {
  try {
    if (!req.body.name || !req.body.price) {
      return res.status(400);
    }
    const item = new Item({
      name: req.body.name,
      price: req.body.price,
    });
    const savedItem = await item.save();
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $push: { items: savedItem._id } },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404);
    }
    res.send({items:savedItem}).status(201);

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});


// Get all items for a specific order in JSON format
router.get("/orders/:orderId/items", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items').exec();
    if (!order) {
      return res.status(404).send("Order not found");
    }
    res.json(order.items);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});
router.get("/orders/:orderId/items/:itemId", async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const itemId = req.params.itemId;
    const order = await Order.findById(orderId).populate('items').exec();
    if (!order) {
      return res.status(404);
    }
    const item = order.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return res.status(404);
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500);
  }
});

// Delete all orders
router.delete("/orders",  async (req, res) => {
  try {
    await Order.deleteMany({}); 
    res.status(204).send(); 
  } catch (error) {
    res.status(500);
  }
});

module.exports = router;
