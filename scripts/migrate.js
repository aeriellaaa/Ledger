const fs = require('fs');
const path = require('path');
const db = require('../models/db');

const OLD_DATA_PATH = path.join(__dirname, '..', 'data', 'data.json');

if (!fs.existsSync(OLD_DATA_PATH)) {
  console.log('No old data.json found — nothing to migrate.');
  process.exit(0);
}

const raw = fs.readFileSync(OLD_DATA_PATH, 'utf-8');
const oldData = JSON.parse(raw);

const insert = db.prepare(`
  INSERT OR IGNORE INTO transactions
    (id, type, amount, category, date, description, recurring, recurrence_frequency, recurrence_endDate, userId)
  VALUES
    (@id, @type, @amount, @category, @date, @description, @recurring, @recurrence_frequency, @recurrence_endDate, @userId)
`);

let count = 0;
for (const t of oldData.transactions || []) {
  insert.run({
    id: t.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    date: t.date,
    description: t.description || '',
    recurring: t.recurring ? 1 : 0,
    recurrence_frequency: t.recurring && t.recurrence ? t.recurrence.frequency : null,
    recurrence_endDate: t.recurring && t.recurrence ? (t.recurrence.endDate || null) : null,
    userId: null
  });
  count++;
}

if (typeof oldData.balance === 'number') {
  db.prepare('UPDATE meta SET value = ? WHERE key = ?').run(oldData.balance.toString(), 'balance');
}

console.log(`Migrated ${count} transaction(s) and balance = ${oldData.balance}`);