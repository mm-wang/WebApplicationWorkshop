const mongoose = require("mongoose");

const sliceSchema = new mongoose.Schema({
  slices: Object,
  model: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model("Slice", sliceSchema);
