/*
 * Yuri's Closet Inventory System
 * Handles inventory counts, sales records, and admin dashboard functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // Set the year in the footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Determine if we're on the worker or admin page
  if (document.getElementById('worker')) {
    initWorkerPage();
  }
  if (document.getElementById('admin')) {
    initAdminPage();
  }
});

/* Utility functions */
function getInventory(price) {
  const key = price === 69 ? 'inventory69' : 'inventory99';
  const stored = localStorage.getItem(key);
  return stored ? parseInt(stored, 10) : 0;
}

function setInventory(price, value) {
  const key = price === 69 ? 'inventory69' : 'inventory99';
  localStorage.setItem(key, value);
}

function getSalesRecords() {
  const data = localStorage.getItem('salesRecords');
  return data ? JSON.parse(data) : [];
}

function addSaleRecord(record) {
  const records = getSalesRecords();
  records.push(record);
  localStorage.setItem('salesRecords', JSON.stringify(records));
}

function groupSalesByDate(records) {
  // Aggregate records by local date (YYYY-MM-DD in the user's timezone)
  const summary = {};
  records.forEach(record => {
    // Prefer the stored local dateKey if available
    let dateKey = record.dateKey;
    if (!dateKey) {
      // Fallback: derive a date string in the store's timezone (America/Denver)
      const d = new Date(record.timestamp);
      const denverDateString = d.toLocaleString('en-US', { timeZone: 'America/Denver' });
      const denverDate = new Date(denverDateString);
      const year = denverDate.getFullYear();
      const month = String(denverDate.getMonth() + 1).padStart(2, '0');
      const day = String(denverDate.getDate()).padStart(2, '0');
      dateKey = `${year}-${month}-${day}`;
    }
    const total = record.price * record.quantity;
    if (!summary[dateKey]) {
      summary[dateKey] = 0;
    }
    summary[dateKey] += total;
  });
  return summary;
}

/* Worker Page */
function initWorkerPage() {
  // Initialize inventory values if they don't exist
  if (localStorage.getItem('inventory69') === null) {
    setInventory(69, 0);
  }
  if (localStorage.getItem('inventory99') === null) {
    setInventory(99, 0);
  }
  updateWorkerInventoryDisplay();

  const saleForm = document.getElementById('sale-form');
  const saleMessage = document.getElementById('sale-message');
  if (saleForm) {
    saleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const price = parseInt(document.getElementById('sale-price').value, 10);
      const quantity = parseInt(document.getElementById('sale-quantity').value, 10);
      const moneyReceivedInput = document.getElementById('money-received');
      const moneyReceived = moneyReceivedInput ? parseFloat(moneyReceivedInput.value) : NaN;
      const current = getInventory(price);
      if (quantity <= 0) {
        saleMessage.textContent = 'Please enter a valid quantity.';
        return;
      }
      if (current < quantity) {
        saleMessage.textContent = `Not enough inventory for ₱${price}. Currently available: ${current}.`;
        return;
      }
      // Calculate total price and ensure money received is sufficient
      const totalPrice = price * quantity;
      if (isNaN(moneyReceived) || moneyReceived < totalPrice) {
        saleMessage.textContent = `Insufficient amount received. Total is ₱${totalPrice}.`;
        return;
      }
      const change = moneyReceived - totalPrice;
      const newInventory = current - quantity;
      setInventory(price, newInventory);
      // Determine the date in the store's timezone (America/Denver).  This avoids
      // shifting the date when the browser runs in a different timezone.
      const now = new Date();
      const denverDateString = now.toLocaleString('en-US', { timeZone: 'America/Denver' });
      const denverDate = new Date(denverDateString);
      const year = denverDate.getFullYear();
      const month = String(denverDate.getMonth() + 1).padStart(2, '0');
      const day = String(denverDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      const record = {
        timestamp: now.toISOString(), // still store the ISO timestamp
        price: price,
        quantity: quantity,
        dateKey: dateKey
      };
      addSaleRecord(record);
      saleMessage.textContent = `Sale recorded! Sold ${quantity} item(s) at ₱${price}. Change: ₱${change.toFixed(2)}.`;
      // Reset fields
      document.getElementById('sale-quantity').value = 1;
      if (moneyReceivedInput) moneyReceivedInput.value = '';
      updateWorkerInventoryDisplay();
    });
  }
}

function updateWorkerInventoryDisplay() {
  const inv69El = document.getElementById('inventory-69');
  const inv99El = document.getElementById('inventory-99');
  if (inv69El) inv69El.textContent = getInventory(69);
  if (inv99El) inv99El.textContent = getInventory(99);
}

/* Admin Page */
function initAdminPage() {
  const passwordSection = document.getElementById('password-section');
  const dashboard = document.getElementById('dashboard');
  const passwordForm = document.getElementById('password-form');
  const passwordMessage = document.getElementById('password-message');
  const adminPasswordField = document.getElementById('admin-password');

  // Hard-coded admin password; in a real application this should be secured.
  const ADMIN_PASSWORD = 'yuriadmin';

  if (passwordForm) {
    passwordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const entered = adminPasswordField.value;
      if (entered === ADMIN_PASSWORD) {
        passwordMessage.textContent = '';
        passwordSection.classList.add('hidden');
        dashboard.classList.remove('hidden');
        loadAdminData();
      } else {
        passwordMessage.textContent = 'Incorrect password.';
      }
      adminPasswordField.value = '';
    });
  }
}

function loadAdminData() {
  updateAdminInventoryDisplay();
  populateHistoryTable();
  populateDailyTable();
  setupStockForm();
  setupExportButton();
}

function updateAdminInventoryDisplay() {
  const inv69El = document.getElementById('admin-inventory-69');
  const inv99El = document.getElementById('admin-inventory-99');
  if (inv69El) inv69El.textContent = getInventory(69);
  if (inv99El) inv99El.textContent = getInventory(99);
}

function populateHistoryTable() {
  const tbody = document.querySelector('#history-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const records = getSalesRecords();
  records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  records.forEach(record => {
    const tr = document.createElement('tr');
    const dateTd = document.createElement('td');
    const priceTd = document.createElement('td');
    const qtyTd = document.createElement('td');
    const totalTd = document.createElement('td');
    const date = new Date(record.timestamp);
    dateTd.textContent = date.toLocaleString();
    priceTd.textContent = `₱${record.price}`;
    qtyTd.textContent = record.quantity;
    totalTd.textContent = `₱${record.price * record.quantity}`;
    tr.appendChild(dateTd);
    tr.appendChild(priceTd);
    tr.appendChild(qtyTd);
    tr.appendChild(totalTd);
    tbody.appendChild(tr);
  });
}

function populateDailyTable() {
  const tbody = document.querySelector('#daily-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const records = getSalesRecords();
  const summary = groupSalesByDate(records);
  // Sort dates descending
  const dates = Object.keys(summary).sort((a, b) => new Date(b) - new Date(a));
  dates.forEach(date => {
    const tr = document.createElement('tr');
    const dateTd = document.createElement('td');
    const totalTd = document.createElement('td');
    // Display the date in the store's timezone
    dateTd.textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'America/Denver' });
    totalTd.textContent = `₱${summary[date]}`;
    tr.appendChild(dateTd);
    tr.appendChild(totalTd);
    tbody.appendChild(tr);
  });
}

function setupStockForm() {
  const stockForm = document.getElementById('stock-form');
  const stockMessage = document.getElementById('stock-message');
  if (stockForm) {
    stockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const price = parseInt(document.getElementById('stock-price').value, 10);
      const quantity = parseInt(document.getElementById('stock-quantity').value, 10);
      if (quantity <= 0) {
        stockMessage.textContent = 'Please enter a valid quantity.';
        return;
      }
      const current = getInventory(price);
      const newInventory = current + quantity;
      setInventory(price, newInventory);
      stockMessage.textContent = `Added ${quantity} item(s) to ₱${price} inventory.`;
      document.getElementById('stock-quantity').value = 1;
      updateAdminInventoryDisplay();
    });
  }
}

/**
 * Attach a click handler to the Export CSV button. When clicked the current
 * sales records will be downloaded as a CSV file. If there are no records
 * an alert will be shown instead.
 */
function setupExportButton() {
  const exportBtn = document.getElementById('export-csv');
  if (!exportBtn) return;
  exportBtn.addEventListener('click', () => {
    const records = getSalesRecords();
    if (!records || records.length === 0) {
      alert('There are no sales records to export.');
      return;
    }
    // Build CSV header
    let csv = 'Date/Time,Price,Quantity,Total\n';
    records.forEach(record => {
      const date = new Date(record.timestamp).toLocaleString();
      const total = record.price * record.quantity;
      csv += `${date},${record.price},${record.quantity},${total}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sales_records.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });
}