const express = require("express");
const isAuth = require("../middlewares/verify-token");

const itemController = require("../controllers/admin");

const router = express.Router();

router.get("/items", isAuth, itemController.getItemsInClientManager);

router.get("/clientItems", itemController.getItemsInClient);

router.post("/item", isAuth, itemController.createItem);

router.get("/item/:itemId", isAuth, itemController.getItem);

router.put("/item/:itemId", isAuth, itemController.updateItem);

router.delete("/item/:itemId", isAuth, itemController.deleteItem);

module.exports = router;
