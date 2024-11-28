const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      require: false,
    },
    price: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    materials: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: false,
      ref:'User'
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Item", itemSchema);
