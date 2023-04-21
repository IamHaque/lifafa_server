const { v4: uuidv4 } = require('uuid');
const { verifyUPI, validatePattern } = require('bhimupijs');

const UPI = require('../database/models/upi.model');
const LIFAFA = require('../database/models/lifafa.model');

module.exports.verifyUpiId = async (req, res) => {
  try {
    const { upiId } = req.body;

    if (!upiId) throw new ApiError('No UPI ID provided');

    const savedUpiId = await UPI.findOne({ upiId });
    if (savedUpiId) {
      return res.send(savedUpiId);
    }

    const { isQueryPatternValid } = validatePattern(upiId);
    if (!isQueryPatternValid) throw new ApiError('Invalid UPI ID pattern');

    const { tpap, pspBank, isVpaVerified, payeeAccountName } = await verifyUPI(
      upiId
    );

    if (!isVpaVerified) throw new ApiError('Invalid UPI ID');

    const _upi = {
      upiId,
      bank: pspBank,
      provider: tpap,
      isVerified: isVpaVerified,
      accountName: payeeAccountName,
    };

    const createdUPI = await UPI.create(_upi);
    if (!createdUPI) return res.send(_upi);

    res.send(createdUPI);
  } catch (e) {
    console.error(e);
    res.status(401).send({
      message: e.name === 'ApiError' ? e.message : 'Failed to verify UPI ID',
    });
  }
};

module.exports.createLifafa = async (req, res) => {
  try {
    const createdBy = req.body.createdBy || 'Anonymous';
    const message =
      req.body.message || 'Every day, be sure to tell somebody thank you';

    const count = Number(req.body.count);
    if (isNaN(count) || count < 1) throw new ApiError('Invalid lifafa count');

    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount < 1) throw new ApiError('Invalid amount');

    const lifafa = await LIFAFA.create({
      count,
      message,
      createdBy,
      claimedBy: [],
      remaining: count,
      initialAmount: amount,
      remainingAmount: amount,
    });

    if (!lifafa) throw new ApiError('Error creating lifafa');
    res.send(lifafa);
  } catch (e) {
    console.error(e);
    res.status(404).send({
      message: e.name === 'ApiError' ? e.message : 'Failed to create lifafa',
    });
  }
};

module.exports.claimLifafa = async (req, res) => {
  try {
    const { upiId, lifafaId, accountName } = req.body;

    const lifafa = await LIFAFA.findById(lifafaId);
    console.log('lifafa:', lifafa);

    if (!lifafa) throw new ApiError('Invalid Lifafa');
    if (lifafa?.remaining <= 0) throw new ApiError('All lifafas claimed');

    if (!lifafa.remaining) lifafa.remaining = lifafa.count;
    if (!lifafa.claimedBy) lifafa.claimedBy = [];

    const alreadyClaimed = lifafa.claimedBy.some(
      (el) => el.upiId === upiId || el.accountName === accountName
    );
    if (alreadyClaimed) throw new ApiError('Already claimed');

    const MAX_DEVIATION = 35;
    const randomPercent = Math.floor(Math.random() * 2 * MAX_DEVIATION);

    const idealAmount = lifafa.remainingAmount / lifafa.remaining;
    const deviatedAmount = (idealAmount * randomPercent) / 200.0;

    let claimedAmount =
      lifafa.remaining === 1
        ? lifafa.remainingAmount
        : randomPercent < MAX_DEVIATION
        ? idealAmount + deviatedAmount
        : idealAmount - deviatedAmount;
    claimedAmount = parseFloat(claimedAmount.toFixed(2));

    const remaining = lifafa.remaining - 1;
    const remainingAmount = parseFloat(
      (lifafa.remainingAmount - claimedAmount).toFixed(2)
    );
    const claimedBy = {
      upiId,
      accountName,
      claimedAmount,
    };

    let updatedLifafa = await LIFAFA.findByIdAndUpdate(
      lifafaId,
      {
        remaining,
        remainingAmount,
        $push: { claimedBy },
      },
      { new: true }
    );

    updatedLifafa = updatedLifafa?._doc;
    if (!updatedLifafa) throw new ApiError('Error claiming lifafa');

    delete updatedLifafa['claimedBy'];
    res.send({ ...updatedLifafa, claimedAmount });
  } catch (e) {
    console.error(e);
    res.status(400).send({
      message: e.name === 'ApiError' ? e.message : 'Failed to claim lifafa',
    });
  }
};

module.exports.getLifafa = async (req, res) => {
  try {
    const { lifafaId } = req.params;
    if (!lifafaId) throw new ApiError('Lifafa ID is required');

    const lifafa = await LIFAFA.findById(lifafaId, '-claimedBy');
    if (!lifafa) throw new ApiError('Invalid Lifafa');

    if (lifafa.remaining > 0) return res.send(lifafa);

    res.send({
      count: lifafa.count,
      createdAt: lifafa.createdAt,
      createdBy: lifafa.createdBy,
      initialAmount: lifafa.initialAmount,
      errorMessage: 'All lifafas already claimed',
    });
  } catch (e) {
    console.error(e);
    res.status(404).send({
      message: e.name === 'ApiError' ? e.message : 'Failed to get lifafa',
    });
  }
};

module.exports.getAllLifafa = async (req, res) => {
  try {
    let allLifafas = await LIFAFA.find();
    res.send(allLifafas);
  } catch (e) {
    console.error(e);
    res.status(404).send({
      message: e.name === 'ApiError' ? e.message : 'Failed to get lifafas',
    });
  }
};

// Generates random UUID of given length
function generateId(length = undefined) {
  // get uuid
  let uuid = uuidv4();
  // remove - decorator
  uuid = uuid.replace(/-/g, '');
  // return substring of given length
  return uuid.substring(0, length);
}

class ApiError {
  constructor(message) {
    this.name = 'ApiError';
    this.message = message;
  }
}
