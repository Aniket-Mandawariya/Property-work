const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    googleLocation: { type: String },
    ownerContact: { type: String },
    ownerName: { type: String },
    ownerEmail: { type: String },
    whatsappNumber: { type: String },
    landmark: { type: String },
    city: { type: String },
    pincode: { type: String },
    propertyType: { type: String },
    areaSqFt: { type: Number },
    frontage: { type: String },
    facing: { type: String },
    parking: { type: String },
    possessionStatus: { type: String },
    floorsAllowed: { type: Number },
    bestFor: [{ type: String }],
    footfallRating: { type: Number },
    roadWidth: { type: String },
    nearby: [{ type: String }],
    pricePerSqFt: { type: Number },
    maintenanceCost: { type: Number },
    negotiable: { type: Boolean, default: false },
    gallery: [{ type: String }],
    videoTourUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    postedBy: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
