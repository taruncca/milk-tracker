const monthSelector = document.getElementById('monthSelector');
const calendar = document.getElementById('calendar');
const popup = document.getElementById('popup');
const quantityPopup = document.getElementById('quantityPopup');
const popupDate = document.getElementById('popupDate');
const overlay = document.getElementById('overlay');
const milkRateInput = document.getElementById('milkRateInput');
const monthTotalEl = document.getElementById('monthTotal');

const today = new Date();
let selectedMonth = today.getMonth();
let selectedYear = today.getFullYear();
let selectedDay = null;

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function loadMonths() {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  monthSelector.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const monthDiv = document.createElement('div');
    monthDiv.className = 'month';
    if (i === today.getMonth()) {
      monthDiv.classList.add('current-month');
    } else if (i < today.getMonth()) {
      monthDiv.classList.add('past-month');
    } else {
      monthDiv.classList.add('future-month');
    }
    monthDiv.innerText = monthNames[i];
    monthDiv.dataset.month = i;
    monthDiv.addEventListener('click', () => {
      selectedMonth = i;
      renderCalendar();
    });
    monthSelector.appendChild(monthDiv);
  }
}

function renderCalendar() {
  calendar.innerHTML = '';
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const isCurrentMonth = selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
  const endDay = isCurrentMonth ? today.getDate() - 1 : daysInMonth;

  let monthTotal = 0;

  for (let day = 1; day <= endDay; day++) {
    const key = `${selectedYear}-${selectedMonth}-${day}`;
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    const status = getDeliveryStatus(key);

    if (status && status.status === 'delivered') {
      dayDiv.classList.add('delivered');
    } else if (status && status.status === 'not-delivered') {
      dayDiv.classList.add('not-delivered');
    }

    dayDiv.innerHTML = `${day}`;
    
    if (status && status.amount) {
      const amountSpan = document.createElement('span');
      amountSpan.className = 'amount';
      amountSpan.innerText = `₹${status.amount}`;
      dayDiv.appendChild(amountSpan);

      monthTotal += parseFloat(status.amount);
    }

    dayDiv.addEventListener('click', () => openStatusPopup(day));
    calendar.appendChild(dayDiv);
  }

  monthTotalEl.innerText = monthTotal.toFixed(2);

  if (isCurrentMonth) {
    const keyToday = `${selectedYear}-${selectedMonth}-${today.getDate()}`;
    if (!getDeliveryStatus(keyToday)) {
      selectedDay = today.getDate();
      openStatusPopup(selectedDay);
    }
  }
}

function openStatusPopup(day) {
  selectedDay = day;
  popupDate.innerText = `Mark for ${selectedDay} ${new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })}`;
  popup.style.display = 'block';
  overlay.style.display = 'block';
}

function closePopup() {
  popup.style.display = 'none';
  quantityPopup.style.display = 'none';
  overlay.style.display = 'none';
}

function setDeliveryStatus(status) {
  const key = `${selectedYear}-${selectedMonth}-${selectedDay}`;
  if (status === 'delivered') {
    popup.style.display = 'none';
    quantityPopup.style.display = 'block';
  } else {
    localStorage.setItem(key, JSON.stringify({ status: 'not-delivered' }));
    renderCalendar();
    closePopup();
  }
}

function saveQuantity() {
  const quantity = parseFloat(document.getElementById('quantityInput').value);
  const rate = parseFloat(milkRateInput.value);
  if (isNaN(quantity) || quantity <= 0) return;

  const amount = (quantity * rate).toFixed(2);
  const key = `${selectedYear}-${selectedMonth}-${selectedDay}`;
  localStorage.setItem(key, JSON.stringify({ status: 'delivered', quantity, amount }));

  renderCalendar();
  closePopup();
}

function getDeliveryStatus(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

document.querySelector('.delivered-btn').addEventListener('click', () => setDeliveryStatus('delivered'));
document.querySelector('.not-delivered-btn').addEventListener('click', () => setDeliveryStatus('not-delivered'));
document.getElementById('saveQuantityBtn').addEventListener('click', saveQuantity);
overlay.addEventListener('click', closePopup);
milkRateInput.addEventListener('change', renderCalendar);

loadMonths();
renderCalendar();
