import mongoose from 'mongoose';

const urlDetailsSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const UrlDetails = mongoose.model('UrlDetails', urlDetailsSchema);

export default UrlDetails;