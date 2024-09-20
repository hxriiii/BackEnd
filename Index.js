const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

// Add a menu item route (Admin)
app.post('/menu/add', async (req, res) => {
    try {
        const { name, price, category } = req.body;
        const newItem = new MenuItem({ name, price, category });
        await newItem.save();

        res.status(200).json({ success: true, message: 'Menu item added successfully.', item: newItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while adding the item.' });
    }
});


app.post('/orders/search', async (req, res) => {
    const { orderId } = req.body;  // Extract orderId from the request body
  
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required.' });
    }
  
    try {
      const order = await Order.findById(orderId);
  
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
  
      res.status(200).json({ success: true, order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error searching for the order.' });
    }
  });
  

// Get all menu items
app.get('/menu', async (req, res) => {
    try {
        const menuItems = await MenuItem.find();
        res.status(200).json({ success: true, items: menuItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the menu.' });
    }
});
// Delete menu item using id
app.delete('/menu/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const deletedItem = await MenuItem.findByIdAndDelete(id);

      if (!deletedItem) {
          return res.status(404).json({ success: false, message: 'Menu item not found.' });
      }

      res.status(200).json({ success: true, message: 'Menu item removed successfully.', item: deletedItem });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'An error occurred while removing the item.' });
  }
});

app.patch('/orders/update-status', async (req, res) => {
  const { orderNumber, status } = req.body;

  if (!orderNumber || !status) {
      return res.status(400).json({ success: false, message: 'orderNumber and status are required.' });
  }

  // Valid statuses in an order 
  const validStatuses = ['Pending', 'Completed', 'Cancelled'];

  if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Allowed statuses are "Pending", "Completed", or "Cancelled".' });
  }

  try {
      // Find the order by orderNumber and update its status
      const updatedOrder = await Order.findOneAndUpdate(
          { orderNumber },
          { status },
          { new: true }  // Return the updated document
      );

      if (!updatedOrder) {
          return res.status(404).json({ success: false, message: 'Order not found.' });
      }

      res.status(200).json({ success: true, message: 'Order status updated successfully.', order: updatedOrder });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error updating the order status.' });
  }
});
//order placing route
app.post('/order', async (req, res) => {
  try {
      const { name, items, totalPrice, deliveryTime } = req.body;

      // Fetch the last order to determine the next order number
      const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
      const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1; // Increment or start at 1

      const newOrder = new Order({
          orderNumber: nextOrderNumber, // Use the next order number
          name,
          items,
          totalPrice,
          deliveryTime: new Date(deliveryTime), 
      });
      await newOrder.save();

      res.status(200).json({ success: true, message: 'Order placed successfully.', order: newOrder });
  } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'An error occurred while placing the order.' });
  }
});




// Get all orders (Admin)
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('items.itemId');
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching orders.' });
    }
});

mongoose.connect("mongodb+srv://admin:0kr39UH3WXw3ShWO@cluster0.ltscpjw.mongodb.net/myDatabase?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to database!");
        app.listen(8800, () => {
            console.log("Server running on port 8800");
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
    });