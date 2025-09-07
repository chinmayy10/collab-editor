const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  _id: String,
  data: {
    type: Object,
    required: true,
    default: { ops: [] }
  }
});

module.exports = mongoose.model("Document", DocumentSchema);
