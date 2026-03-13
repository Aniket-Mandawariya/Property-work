const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

// Serve frontend assets when deployed on platforms like Render
const frontendDir = path.join(__dirname, "..", "Frontend");

app.use(cors());
app.use(express.json());   // VERY IMPORTANT
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(frontendDir));

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));

// Fallback to index.html for root requests so the static site loads
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
