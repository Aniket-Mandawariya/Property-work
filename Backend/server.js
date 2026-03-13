const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());   // VERY IMPORTANT
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the Frontend directory
app.use(express.static(path.join(__dirname, "../Frontend")));

// API routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));

// Catch-all handler: send back index.html for any non-API routes (for SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
