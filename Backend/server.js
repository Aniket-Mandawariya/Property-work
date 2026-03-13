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

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
