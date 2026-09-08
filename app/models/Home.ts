import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  firstSection: {
    isHidden: { type: Boolean, default: false },
    Image: { type: String },
    ImageAlt: { type: String },
    items: {
      type: [
        {
          title: { type: String },
          description: { type: String },
        },
      ],
      default: [],
    },
  },
});

export default mongoose.models.home || mongoose.model("home", homeSchema);
