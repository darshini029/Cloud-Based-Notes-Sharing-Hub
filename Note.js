const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  category: { type: String, default: "Other" },
  description: { type: String, default: "" },
  fileName: { type: String, default: "" },
  originalName: { type: String, default: "" },
  filePath: { type: String, default: "" },
  fileSize: { type: Number, default: 0 },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  downloads: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Note", noteSchema);