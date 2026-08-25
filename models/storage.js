const db = require('./db');

function rowToTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    category: row.category,
    date: row.date,
    description: row.description,
    recurring: !!row.recurring,
    recurrence: row.recurring
      ? {
          frequency: row.recurrence_frequency,
          endDate: row.recurrence_endDate
        }
      : null,
    userId: row.userId || null
  };
}

function readData() {
  const rows = db.prepare('SELECT * FROM transactions').all();
  const balanceRow = db.prepare('SELECT value FROM meta WHERE key = ?').get('balance');
  return {
    balance: balanceRow ? parseFloat(balanceRow.value) : 0,
    transactions: rows.map(rowToTransaction)
  };
}

function writeData(data) {
  const deleteAll = db.prepare('DELETE FROM transactions');
  const insert = db.prepare(`
    INSERT INTO transactions
      (id, type, amount, category, date, description, recurring, recurrence_frequency, recurrence_endDate, userId)
    VALUES
      (@id, @type, @amount, @category, @date, @description, @recurring, @recurrence_frequency, @recurrence_endDate, @userId)
  `);

  const syncAll = db.transaction((transactions) => {
    deleteAll.run();
    for (const t of transactions) {
      insert.run({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        date: t.date,
        description: t.description || '',
        recurring: t.recurring ? 1 : 0,
        recurrence_frequency: t.recurring ? t.recurrence.frequency : null,
        recurrence_endDate: t.recurring ? (t.recurrence.endDate || null) : null,
        userId: t.userId || null
      });
    }
  });

  syncAll(data.transactions);

  if (typeof data.balance === 'number') {
    db.prepare('UPDATE meta SET value = ? WHERE key = ?').run(data.balance.toString(), 'balance');
  }
}

module.exports = { readData, writeData };