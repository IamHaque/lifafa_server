const authenticateKey = async (req, res, next) => {
  // Get API key from request headers
  const { apikey: apiKey } = req.headers;

  // No Api key found
  if (!apiKey) {
    // Reject request if no API key
    return res.status(403).send({
      error: 'API key missing',
    });
  }

  // Check if apiKey is valid
  if (apiKey !== process.env.API_KEY) {
    // Reject request if API key doesn't match
    return res.status(403).send({
      error: 'Invalid API key',
    });
  }

  next();
};

module.exports = { authenticateKey };
