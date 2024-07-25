const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../data/dbConfig');
const restricted = require('../middleware/restricted'); // Ensure correct path

// Register endpoint
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  try {
    // Check if the username already exists
    const existingUser = await db('users').where({ username }).first();
    if (existingUser) {
      return res.status(400).json({ message: "username taken" });
    }

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Insert the new user into the database
    const [id] = await db('users').insert({ username, password: hashedPassword });

    // Respond with the new user's details
    res.status(201).json({ id, username, password: hashedPassword });
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate request body
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  try {
    // Check if the user exists
    const user = await db('users').where({ username }).first();
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user.id }, process.env.SECRET || 'shh', { expiresIn: '1h' });

    // Respond with a welcome message and the token
    res.status(200).json({ message: `welcome, ${username}`, token });
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;
