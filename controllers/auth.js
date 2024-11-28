const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const brand = req.body.brand;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
      brand: brand
    });

    const result = user.save();

    return res
      .status(201)
      .json({ message: "User saved successfully", userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const brand = req.body.brand;
    const user = await User.findOne({ email: email, brand: brand });

    if (!user) {
      const error = new Error("a user with this email not found");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const error = new Error("wrong password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id.toString(), brand: user.brand },
      "AtlasMallGreenGemCHR2018",
      {
        expiresIn: "100h"
      }
    );

    res
      .status(200)
      .json({ token: token, userId: user._id.toString(), brand: user.brand });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
