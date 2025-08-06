// Yuri's Closet Admin Dashboard script

// Utility functions to manage inventory and sales records in localStorage
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

// Ensure default values exist for inventory and sales
function initializeStorage() {
  if (localStorage.getItem('inventory69') === null) setInventory(69, 0);
  if (localStorage.getItem('inventory99') === null) setInventory(99, 0);
  if (localStorage.getItem('salesRecords') === null) localStorage.setItem('salesRecords', JSON.stringify([]));
}

// Group sales by date and accumulate quantities and totals
function groupSalesByDate(records) {
  const summary = {};
  records.forEach(record => {
    const date = record.dateKey;
    if (!summary[date]) {
      summary[date] = { qty69: 0, qty99: 0, total: 0 };
    }
    if (record.price === 69) summary[date].qty69 += record.quantity;
    if (record.price === 99) summary[date].qty99 += record.quantity;
    summary[date].total += record.price * record.quantity;
  });
  return summary;
}

// Format currency helper
function formatCurrency(value) {
  return `₱${value.toFixed(2)}`;
}

// Refresh dashboard metrics, tables and charts
function refreshDashboard() {
  updateMetrics();
  populateHistoryTable();
  populateDailyTable();
  renderSalesChart();
  renderInventoryChart();
}

// Update the metric cards
function updateMetrics() {
  const inv69 = getInventory(69);
  const inv99 = getInventory(99);
  const records = getSalesRecords();
  let totalIncome = 0;
  records.forEach(r => totalIncome += r.price * r.quantity);
  document.getElementById('metric-inv69').textContent = inv69;
  document.getElementById('metric-inv99').textContent = inv99;
  document.getElementById('metric-sales-count').textContent = records.length;
  document.getElementById('metric-total-income').textContent = formatCurrency(totalIncome);
  // We could calculate percentage change if previous period values were stored; leave blank for now

  // Also update any inventory summary table cells on pages like stocks.html
  const inv69Cell = document.getElementById('inv69-table');
  if (inv69Cell) inv69Cell.textContent = inv69;
  const inv99Cell = document.getElementById('inv99-table');
  if (inv99Cell) inv99Cell.textContent = inv99;
}

// Populate purchase history table
function populateHistoryTable() {
  const tbody = document.querySelector('#history-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const records = getSalesRecords();
  // Sort descending by timestamp
  records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  records.forEach(record => {
    const tr = document.createElement('tr');
    const dateTd = document.createElement('td');
    const priceTd = document.createElement('td');
    const qtyTd = document.createElement('td');
    const paidTd = document.createElement('td');
    const changeTd = document.createElement('td');
    const dateObj = new Date(record.timestamp);
    dateTd.textContent = dateObj.toLocaleString('en-US', { timeZone: 'America/Denver' });
    priceTd.textContent = `₱${record.price}`;
    qtyTd.textContent = record.quantity;
    // Use paid and change if available, otherwise use '-' to indicate unknown
    if (typeof record.paid === 'number') {
      const total = record.price * record.quantity;
      const change = record.paid - total;
      paidTd.textContent = formatCurrency(record.paid);
      changeTd.textContent = formatCurrency(change);
    } else {
      paidTd.textContent = '-';
      changeTd.textContent = '-';
    }
    tr.appendChild(dateTd);
    tr.appendChild(priceTd);
    tr.appendChild(qtyTd);
    tr.appendChild(paidTd);
    tr.appendChild(changeTd);
    tbody.appendChild(tr);
  });
}

// Populate daily summary table showing quantities sold per price
function populateDailyTable() {
  const tbody = document.querySelector('#daily-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const records = getSalesRecords();
  const grouped = groupSalesByDate(records);
  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
  dates.forEach(date => {
    const summary = grouped[date];
    const tr = document.createElement('tr');
    const dateTd = document.createElement('td');
    dateTd.textContent = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'America/Denver' });
    const qty69Td = document.createElement('td');
    qty69Td.textContent = summary.qty69;
    const qty99Td = document.createElement('td');
    qty99Td.textContent = summary.qty99;
    tr.appendChild(dateTd);
    tr.appendChild(qty69Td);
    tr.appendChild(qty99Td);
    tbody.appendChild(tr);
  });
}

// Render bar chart for daily gross sales
let salesChartInstance;
function renderSalesChart() {
  const canvas = document.getElementById('salesChart');
  if (!canvas) return;
  const records = getSalesRecords();
  const grouped = groupSalesByDate(records);
  const dates = Object.keys(grouped).sort();
  const labels = dates.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric' }));
  const totals = dates.map(d => grouped[d].total);
  // Destroy previous chart if exists
  if (salesChartInstance) {
    salesChartInstance.destroy();
  }
  salesChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Gross Sales (₱)',
        data: totals,
        backgroundColor: 'rgba(76, 81, 191, 0.6)',
        borderColor: 'rgba(76, 81, 191, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Render bar chart for quantity sold per price each day
let inventoryChartInstance;
function renderInventoryChart() {
  const canvas = document.getElementById('inventoryChart');
  if (!canvas) return;
  const records = getSalesRecords();
  const grouped = groupSalesByDate(records);
  const dates = Object.keys(grouped).sort();
  const labels = dates.map(d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { timeZone: 'America/Denver', month: 'short', day: 'numeric' }));
  const qty69 = dates.map(d => grouped[d].qty69);
  const qty99 = dates.map(d => grouped[d].qty99);
  if (inventoryChartInstance) {
    inventoryChartInstance.destroy();
  }
  inventoryChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: '69 Sold',
          data: qty69,
          backgroundColor: 'rgba(28, 168, 221, 0.6)',
          borderColor: 'rgba(28, 168, 221, 1)',
          borderWidth: 1
        },
        {
          label: '99 Sold',
          data: qty99,
          backgroundColor: 'rgba(232, 93, 117, 0.6)',
          borderColor: 'rgba(232, 93, 117, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Handle Add Stock form submission
function handleAddStock(e) {
  e.preventDefault();
  const price = parseInt(document.getElementById('stock-price').value, 10);
  const quantity = parseInt(document.getElementById('stock-qty').value, 10);
  if (quantity <= 0) return;
  const current = getInventory(price);
  setInventory(price, current + quantity);
  // Reset form
  document.getElementById('stock-qty').value = 1;
  refreshDashboard();
}

// Handle Record Sale form submission
function handleRecordSale(e) {
  e.preventDefault();
  const price = parseInt(document.getElementById('sale-price').value, 10);
  const quantity = parseInt(document.getElementById('sale-qty').value, 10);
  const paid = parseFloat(document.getElementById('sale-paid').value);
  if (quantity <= 0) return;
  const current = getInventory(price);
  if (current < quantity) {
    alert(`Not enough inventory for ₱${price}. Currently available: ${current}`);
    return;
  }
  const total = price * quantity;
  if (isNaN(paid) || paid < total) {
    alert(`Insufficient amount received. Total is ₱${total}`);
    return;
  }
  // Update inventory
  setInventory(price, current - quantity);
  // Determine date key in America/Denver timezone
  const now = new Date();
  const denverString = now.toLocaleString('en-US', { timeZone: 'America/Denver' });
  const denverDate = new Date(denverString);
  const year = denverDate.getFullYear();
  const month = String(denverDate.getMonth() + 1).padStart(2, '0');
  const day = String(denverDate.getDate()).padStart(2, '0');
  const dateKey = `${year}-${month}-${day}`;
  // Store record including paid amount
  addSaleRecord({ timestamp: now.toISOString(), price: price, quantity: quantity, paid: paid, dateKey: dateKey });
  // Reset form
  document.getElementById('sale-qty').value = 1;
  document.getElementById('sale-paid').value = '';
  refreshDashboard();
}

// Export sales records to CSV
function exportCSV() {
  const records = getSalesRecords();
  if (!records || records.length === 0) {
    alert('There are no sales records to export.');
    return;
  }
  let csv = 'Date/Time,Price,Quantity,Paid,Total,Change\n';
  records.forEach(record => {
    const date = new Date(record.timestamp).toLocaleString('en-US', { timeZone: 'America/Denver' });
    const total = record.price * record.quantity;
    const paid = typeof record.paid === 'number' ? record.paid : '';
    const change = typeof record.paid === 'number' ? (record.paid - total) : '';
    csv += `${date},${record.price},${record.quantity},${paid},${total},${change}\n`;
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
}

// Setup event listeners and initial display
document.addEventListener('DOMContentLoaded', () => {
  // Initialize storage
  initializeStorage();
  // Set year and current date
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const todayEl = document.getElementById('today-date');
  if (todayEl) {
    const now = new Date();
    const denverStr = now.toLocaleString('en-US', { timeZone: 'America/Denver', weekday:'long', month:'long', day:'numeric', year:'numeric' });
    todayEl.textContent = denverStr;
  }
  // Set default date range inputs to last 7 days (optional)
  const startInput = document.getElementById('date-start');
  const endInput = document.getElementById('date-end');
  if (startInput && endInput) {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    const past = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const startDate = past.toISOString().split('T')[0];
    startInput.value = startDate;
    endInput.value = endDate;
  }
  // Attach form handlers
  const stockForm = document.getElementById('stock-form');
  if (stockForm) stockForm.addEventListener('submit', handleAddStock);
  const saleForm = document.getElementById('sale-form');
  if (saleForm) saleForm.addEventListener('submit', handleRecordSale);
  const exportBtn = document.getElementById('export-csv');
  if (exportBtn) exportBtn.addEventListener('click', exportCSV);
  // Initial render
  refreshDashboard();
});