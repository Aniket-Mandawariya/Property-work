const express = require("express");
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  deleteProperty
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", protect, upload.single("image"), createProperty);
router.delete("/:id", protect, deleteProperty);

module.exports = router;
