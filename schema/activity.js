const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  activity_type: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  photo_id: { type: mongoose.Schema.Types.ObjectId, ref: "Photo" },
  date_time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Activity", activitySchema);
