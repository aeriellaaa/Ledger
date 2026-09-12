const express = require('express');
const path = require('path');
const cors = require('cors');
const transactionsRouter = require('./routes/transactions');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const forecastRouter = require('./routes/forecast');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/transactions', authMiddleware,transactionsRouter);
app.use('/api/auth', authRouter);
app.use('/api/forecast',authMiddleware,forecastRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
