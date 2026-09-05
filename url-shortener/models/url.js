import mongoose from "mongoose";


const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
     
    },
  },
  {
    timestamps: true,
  },
);
urlSchema.index({ shortUrl: 1 },{unique:true});

export const Url=mongoose.models.Url || mongoose.model("Url", urlSchema);