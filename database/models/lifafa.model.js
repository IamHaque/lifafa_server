const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lifafaSchema = new Schema(
  {
    count: Number,
    remaining: Number,
    initialAmount: Number,
    remainingAmount: Number,
    message: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    claimedBy: [
      {
        upiId: {
          type: String,
          trim: true,
        },
        accountName: {
          type: String,
          trim: true,
        },
        claimedAmount: Number,
      },
      {
        timestamps: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lifafa', lifafaSchema);
