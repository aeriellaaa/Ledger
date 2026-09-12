const express = require('express');
const router = express.Router();
const { readData } = require('../models/storage');
const { generateForecast } = require('../models/forecast');

router.get('/', async (req, res) => {
  const months = parseInt(req.query.months, 10);
  if (!req.query.months || isNaN(months) || months <= 0) {
    return res.status(400).json({ errors: ['months query param must be a positive number'] });
  }
  if (months > 60) {
    return res.status(400).json({ errors: ['months cannot exceed 60'] });
  }

  let data;
  try {
    data = await readData(req.userId);
  } catch (err) {
    return res.status(500).json({ errors: ['Failed to read data'] });
  }

  if (typeof data.balance !== 'number') {
    return res.status(500).json({ errors: ['Stored balance is invalid or missing'] });
  }

  const forecast = generateForecast(data.balance, data.transactions || [], months);
  res.json(forecast);
});

module.exports = router;