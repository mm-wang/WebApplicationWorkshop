const mongoose = require("mongoose");

const sphereSchema = new mongoose.Schema({
  sphere: Object,
  volume: Number
});

module.exports = mongoose.model("Sphere", sphereSchema);
