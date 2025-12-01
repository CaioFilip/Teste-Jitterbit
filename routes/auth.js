const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

// Login simples (fixo)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username !== "admin" || password !== "123456") {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = jwt.sign(
    { user: username },
    SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;
