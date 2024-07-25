const jwt = require('jsonwebtoken');

function restricted(req, res, next) {
  const token = req.headers.authorization;

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ message: "token required" });
  }

  // Verify the token
  jwt.verify(token, process.env.SECRET || 'shh', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "token invalid" });
    }

    req.decoded = decoded;
    next();
  });
}

module.exports = restricted;
