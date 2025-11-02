function doGet(e) {
  const ss = SpreadsheetApp.getActive();
  const sheetTransactions = ss.getSheetByName('transactions');
  const sheetAccounts = ss.getSheetByName('accounts');
  const sheetDebts = ss.getSheetByName('debts');
  const sheetCounterparties = ss.getSheetByName('counterparties');
  
  const action = e.parameter.action;

  if (action === 'getAccounts') return json(sheetToObjects(sheetAccounts));
  if (action === 'getDebts') return json(sheetToObjects(sheetDebts));
  if (action === 'getCounterparties') return json(sheetToObjects(sheetCounterparties));

  if (action === 'getTransactions') {
    const data = sheetToObjects(sheetTransactions);
    const lastTen = data.slice(-10).reverse();
    return json(lastTen);
  }

  if (action === 'addTransaction') {
    const { date, from, to, amount } = e.parameter;
    const transaction_id = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    sheetTransactions.appendRow([transaction_id, date, from, to, amount]);
    return json({ status: 'success', transaction_id });
  }

  if (action === 'deleteTransaction') {
    const id = e.parameter.id;
    const data = sheetToObjects(sheetTransactions);
    const rowIndex = data.findIndex(row => String(row.transaction_id) === String(id));
    if (rowIndex >= 0) {
      sheetTransactions.deleteRow(rowIndex + 2); // +2 из-за заголовка и индекса массива
      return json({ status: 'deleted', transaction_id: id });
    } else {
      return json({ status: 'not_found', transaction_id: id });
    }
  }

  return json({ error: 'Unknown action' });
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data
    .filter(r => r.join('').trim() !== '')
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
