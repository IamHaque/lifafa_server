const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const upiSchema = new Schema(
  {
    upiId: {
      type: String,
      trim: true,
      unique: true,
    },
    bank: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    accountName: {
      type: String,
      trim: true,
    },
    isVerified: Boolean,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Upi', upiSchema);
