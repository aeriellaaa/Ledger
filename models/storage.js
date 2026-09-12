const supabase = require('./supabaseClient');

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
          endDate: row.recurrence_end_date
        }
      : null,
    userId: row.user_id
  };
}

async function readData(userId) {
  let query = supabase.from('transactions').select('*');
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const { data: balanceRow } = await supabase
    .from('meta')
    .select('value')
    .eq('key', 'balance')
    .single();

  return {
    balance: balanceRow ? parseFloat(balanceRow.value) : 0,
    transactions: data.map(rowToTransaction)
  };
}

async function insertTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description || '',
      recurring: transaction.recurring,
      recurrence_frequency: transaction.recurring ? transaction.recurrence.frequency : null,
      recurrence_end_date: transaction.recurring ? (transaction.recurrence.endDate || null) : null,
      user_id: transaction.userId
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToTransaction(data);
}

async function updateTransaction(id, userId, transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      date: transaction.date,
      description: transaction.description || '',
      recurring: transaction.recurring,
      recurrence_frequency: transaction.recurring ? transaction.recurrence.frequency : null,
      recurrence_end_date: transaction.recurring ? (transaction.recurrence.endDate || null) : null
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) return null;
  return rowToTransaction(data);
}

async function deleteTransaction(id, userId) {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) return false;
  return true;
}

module.exports = { readData, insertTransaction, updateTransaction, deleteTransaction };