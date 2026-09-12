const express = require('express');
const router = express.Router();
const { readData, insertTransaction, updateTransaction, deleteTransaction } = require('../models/storage');
const { validateTransaction, buildTransaction } = require('../models/transaction');

// GET /api/transactions — list all, with optional filters
router.get('/', async (req, res) => {
  try {
    const data = await readData(req.userId);
    let transactions = data.transactions;
    const { from, to, category } = req.query;
    if (from) {
      transactions = transactions.filter(t => t.date >= from);
    }
    if (to) {
      transactions = transactions.filter(t => t.date <= to);
    }
    if (category) {
      transactions = transactions.filter(t => t.category === category);
    }
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// POST /api/transactions — create
router.post('/', async (req, res) => {
  const errors = validateTransaction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  try {
    const newTransaction = buildTransaction(req.body);
    newTransaction.userId = req.userId;
    const saved = await insertTransaction(newTransaction);
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// PUT /api/transactions/:id — edit
router.put('/:id', async (req, res) => {
  const errors = validateTransaction(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  try {
    const updated = buildTransaction(req.body);
    const result = await updateTransaction(req.params.id, req.userId, updated);
    if (!result) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

// DELETE /api/transactions/:id — delete
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteTransaction(req.params.id, req.userId);
    if (!success) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ errors: [err.message] });
  }
});

module.exports = router;