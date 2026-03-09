const Property = require("../models/Property");

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : undefined;
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["true", "1", "yes", "y"].includes(normalized);
  }
  return false;
};

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (_) {}
  }
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

exports.createProperty = async (req, res) => {
  try {
    const body = req.body || {};
    const storeName = body.storeName || body.Storename || body.store || body.shopName;
    const title = body.title || body.Tittle || body.propertyTitle || body.name;
    const location = body.location || body.address || body.city;
    const description = body.description || body.decription || body.details || "";
    const googleLocation =
      body.googleLocation || body.googleMapLink || body.mapUrl || body.locationUrl || "";
    const ownerContact =
      body.ownerContact || body.ownerPhone || body.contactNumber || body.phone || "";
    const ownerName = body.ownerName || "";
    const ownerEmail = body.ownerEmail || "";
    const whatsappNumber = body.whatsappNumber || body.whatsapp || "";
    const landmark = body.landmark || "";
    const city = body.city || "";
    const pincode = body.pincode || "";
    const propertyType = body.propertyType || "";
    const frontage = body.frontage || "";
    const facing = body.facing || "";
    const parking = body.parking || "";
    const possessionStatus = body.possessionStatus || "";
    const roadWidth = body.roadWidth || "";
    const videoTourUrl = body.videoTourUrl || body.videoUrl || "";
    const postedBy = body.postedBy || "";

    const rawPrice = body.price;
    const numericPrice = parseNumber(rawPrice);
    const areaSqFt = parseNumber(body.areaSqFt);
    const floorsAllowed = parseNumber(body.floorsAllowed);
    const footfallRating = parseNumber(body.footfallRating);
    const pricePerSqFt = parseNumber(body.pricePerSqFt);
    const maintenanceCost = parseNumber(body.maintenanceCost);
    const bestFor = parseStringArray(body.bestFor);
    const nearby = parseStringArray(body.nearby);
    const gallery = parseStringArray(body.gallery);
    const negotiable = parseBoolean(body.negotiable);
    const isFeatured = parseBoolean(body.isFeatured);

    if (!storeName || !title || !location || rawPrice === undefined) {
      return res.status(400).json({
        message: "storeName, title, location and price are required"
      });
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message: "price must be a valid positive number"
      });
    }

    const property = await Property.create({
      storeName,
      title,
      location,
      price: numericPrice,
      description,
      googleLocation: String(googleLocation).trim(),
      ownerContact: String(ownerContact).trim(),
      ownerName: String(ownerName).trim(),
      ownerEmail: String(ownerEmail).trim(),
      whatsappNumber: String(whatsappNumber).trim(),
      landmark: String(landmark).trim(),
      city: String(city).trim(),
      pincode: String(pincode).trim(),
      propertyType: String(propertyType).trim(),
      areaSqFt,
      frontage: String(frontage).trim(),
      facing: String(facing).trim(),
      parking: String(parking).trim(),
      possessionStatus: String(possessionStatus).trim(),
      floorsAllowed,
      bestFor,
      footfallRating,
      roadWidth: String(roadWidth).trim(),
      nearby,
      pricePerSqFt,
      maintenanceCost,
      negotiable,
      gallery,
      videoTourUrl: String(videoTourUrl).trim(),
      isFeatured,
      postedBy: String(postedBy).trim(),
      image: req.file ? req.file.filename : null
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const { storeName, location, minPrice, maxPrice } = req.query;

    let filter = {};

    if (storeName) {
      filter.storeName = { $regex: storeName, $options: "i" };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
