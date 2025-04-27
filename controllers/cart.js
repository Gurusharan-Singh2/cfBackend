import User from "../models/user.js";
import redis from "../redis.js";

const AddToCart = async (req, res) => {
  try {
    const { id, bookid } = req.headers;
    if (!id || !bookid) {
      return res.status(400).json({ message: "Book id || User id not available" });
    }

    const userdata = await User.findById(id);
    const isBookCarted = userdata.cart.includes(bookid);
    if (isBookCarted) {
      return res.status(200).json({ message: "Book already in cart" });
    }

    await User.findByIdAndUpdate(id, { $push: { cart: bookid } });

    // Invalidate Redis cache for user's cart
    await redis.del(`cart:${id}`);

    return res.status(200).json({ message: "Book Added in cart" });

  } catch (error) {
    return res.status(500).json({ message: "Invalid response" });
  }
};

const DeleteFromCart = async (req, res) => {
  try {
    const { id } = req.headers;
    const { bookid } = req.params;
    if (!id || !bookid) {
      return res.status(400).json({ message: "Book id || User id not available" });
    }

    const userdata = await User.findById(id);
    const isBookCarted = userdata.cart.includes(bookid);
    if (!isBookCarted) {
      return res.status(200).json({ message: "Book not in cart" });
    }

    await User.findByIdAndUpdate(id, { $pull: { cart: bookid } });

    // Invalidate Redis cache for user's cart
    await redis.del(`cart:${id}`);

    return res.status(200).json({ message: "Book Deleted from cart" });

  } catch (error) {
    return res.status(500).json({ message: "Invalid response" });
  }
};

const GetCart = async (req, res) => {
  try {
    const { id } = req.headers;
    if (!id) {
      return res.status(400).json({ message: "User id is needed" });
    }

    // First check cache
    const cachedCart = await redis.get(`cart:${id}`);
    if (cachedCart) {
      console.log('Serving cart from Redis cache...');
      return res.status(200).json({
        message: "success (from cache)",
        cart: JSON.parse(cachedCart)
      });
    }

    // If not in cache, fetch from DB
    const user = await User.findById(id).populate("cart");
    const cartData = user.cart.reverse();

    // Save to cache
    await redis.set(`cart:${id}`, JSON.stringify(cartData), 'EX', 180); // cache for 3 mins

    return res.status(200).json({ message: "success (from DB)", cart: cartData });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { AddToCart, DeleteFromCart, GetCart };
