const Items = require("../models/item");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");

exports.getItemsInClient = async (req, res) => {
  try {
    const totalItems = await Items.countDocuments();
    const items = await Items.find();
    res.status(200).json({
      message: "Fetched items successfully.",
      posts: items,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getItemsInClientManager = async (req, res) => {
  try {
    // const totalItems = await Items.countDocuments();
    const items = await Items.find({ creator: req.creator._id });
    res.status(200).json({
      message: "Fetched items successfully.",
      posts: items,
      // totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createItem = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("Please upload a image");
      error.statusCode = 422;
      throw error;
    }

    const name = req.body.name;
    const materials = req.body.materials;
    const brand = req.body.brand;
    const price = req.body.price;
    const status = req.body.status;

    const item = new Items({
      name: name,
      materials: materials,
      imageUrl: req.file.path,
      brand: brand,
      price: price,
      status: status,
      creator: req.userId
    });

    const itemResult = await item.save();

    const user = await User.findById(req.userId);

    user.items.push(itemResult);

    const creator = await user.save();

    res.status(201).json({
      message: "Post Created Successfully",
      post: itemResult,
      creator: creator
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const name = req.body.name;
    const materials = req.body.materials;
    let imageUrl = req.body.image;
    const brand = req.body.brand;
    const price = req.body.price;
    const status = req.body.status;

    if (req.file) {
      imageUrl = req.file.path;
    }

    const item = await Items.findById(itemId);

    if (!item) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if (item.creator.toString() != req.userId) {
      const error = new Error("not authorized");
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl != item.imageUrl && imageUrl != "undefined") {
      clearImage(item.imageUrl);
      item.imageUrl = imageUrl;
    }

    item.name = name;
    item.materials = materials;
    item.brand = brand;
    item.price = price;
    item.status = status;

    await item.save();
    res.status(200).json({
      message: "Post Updated Successfully",
      item: item
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;

    const item = await Items.findById(itemId);

    if (!item) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    if (item.creator.toString() != req.userId) {
      const error = new Error("not authorized");
      error.statusCode = 403;
      throw error;
    }

    clearImage(item.imageUrl);

    await item.remove();

    const user = await User.findById(req.userId);

    user.items.pull(mongoose.Types.ObjectId(itemId));

    await user.save();

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getItem = async (req, res, next) => {
  try {
    const itemId = req.params.itemId;
    const item = await Items.findById(itemId).populate("creator", "name");

    if (!item) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", item: item });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filepath = path.join(__dirname, "..", filePath);

  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);

    console.log("Image deleted successfully");
  } else {
    console.log("Image not found");
  }
};
