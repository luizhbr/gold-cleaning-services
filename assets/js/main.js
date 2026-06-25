// ==================== PRICE CALCULATOR ====================
const pricing = {
  biweekly: {
    "1-1":   { standard: [100, 120], deep: [200, 230] },
    "2-1":   { standard: [110, 130], deep: [250, 280] },
    "2-2":   { standard: [120, 140], deep: [250, 280] },
    "3-2":   { standard: [120, 140], deep: [280, 300] },
    "4-2.5": { standard: [140, 160], deep: [300, 320] }
  },
  monthly: {
    "1-1":   { standard: [150, 180] },
    "2-1":   { standard: [180, 200] },
    "2-2":   { standard: [190, 200] },
    "3-2":   { standard: [210, 230] },
    "4-2.5": { standard: [230, 250] }
  }
};

function updatePrice() {
  const freq = document.getElementById('freq').value;
  const homeSize = document.getElementById('homeSize').value;
  const cleanType = document.getElementById('cleanType').value;
  const resultPrice = document.getElementById('resultPrice');
  const resultDetails = document.getElementById('resultDetails');
  let priceRange, detailsText;
  if (freq === 'biweekly') {
    const data = pricing.biweekly[homeSize];
    if (cleanType === 'deep') {
      priceRange = `$${data.deep[0]} – $${data.deep[1]}`;
      detailsText = 'Bi-Weekly • Deep Clean';
    } else {
      priceRange = `$${data.standard[0]} – $${data.standard[1]}`;
      detailsText = 'Bi-Weekly • Standard Clean';
    }
  } else {
    const data = pricing.monthly[homeSize];
    priceRange = `$${data.standard[0]} – $${data.standard[1]}`;
    detailsText = 'Monthly • Standard Clean';
    if (cleanType === 'deep') document.getElementById('cleanType').value = 'standard';
  }
  resultPrice.textContent = priceRange;
  resultDetails.textContent = detailsText;
}

function toggleCleanType() {
  const freq = document.getElementById('freq').value;
  const cleanTypeSelect = document.getElementById('cleanType');
  if (freq === 'monthly') {
    cleanTypeSelect.value = 'standard';
    cleanTypeSelect.querySelector('option[value="deep"]').disabled = true;
  } else {
    cleanTypeSelect.querySelector('option[value="deep"]').disabled = false;
  }
}

document.getElementById('freq').addEventListener('change', () => { toggleCleanType(); updatePrice(); });
document.getElementById('homeSize').addEventListener('change', updatePrice);
document.getElementById('cleanType').addEventListener('change', updatePrice);

// ==================== SCHEDULER ====================
(function() {
  // -- EmailJS config (replace with your real IDs after signing up at emailjs.com) --
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';

  // Available time slots (mon-sat)
  const TIME_SLOTS = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM'];

  // Simulate a few booked slots (in real use, fetch from backend/sheet)
  const BOOKED = {};

  let currentYear, currentMonth, selectedDate = null, selectedTime = null;

  const today = new Date();
  currentYear  = today.getFullYear();
  currentMonth = today.getMonth();

  function formatDate(y, m, d) {
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  function renderCalendar() {
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    document.getElementById('calMonthLabel').textContent = `${monthNames[currentMonth]} ${currentYear}`;

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
    const container = document.getElementById('calDays');
    container.innerHTML = '';

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day empty';
      container.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.textContent = d;
      const dateStr = formatDate(currentYear, currentMonth, d);
      const cellDate = new Date(currentYear, currentMonth, d);
      const dow = cellDate.getDay();

      // Disable: past days, Sundays (0), and already fully booked dates
      const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isSunday = dow === 0;

      if (isPast || isSunday) {
        cell.className = 'cal-day disabled';
      } else {
        cell.className = 'cal-day';
        if (dateStr === formatDate(today.getFullYear(), today.getMonth(), today.getDate())) {
          cell.classList.add('today');
        }
        if (selectedDate === dateStr) cell.classList.add('selected');

        cell.addEventListener('click', () => selectDate(dateStr, d));
      }
      container.appendChild(cell);
    }
  }

  function selectDate(dateStr, d) {
    selectedDate = dateStr;
    selectedTime = null;
    renderCalendar();
    renderTimeSlots(dateStr);
    updateContinueBtn();
  }

  function renderTimeSlots(dateStr) {
    const booked = BOOKED[dateStr] || [];
    const container = document.getElementById('timeSlots');
    container.innerHTML = '';

    const cellDate = new Date(dateStr + 'T00:00:00');
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const label = `${dayNames[cellDate.getDay()]}, ${monthNames[cellDate.getMonth()]} ${cellDate.getDate()}`;
    document.getElementById('timePanelLabel').textContent = label;

    TIME_SLOTS.forEach(slot => {
      const isBooked = booked.includes(slot);
      const btn = document.createElement('div');
      btn.className = 'time-slot' + (isBooked ? ' disabled' : '');
      btn.textContent = isBooked ? slot + ' ✗' : slot;
      if (slot === selectedTime) btn.classList.add('selected');
      if (!isBooked) {
        btn.addEventListener('click', () => {
          selectedTime = slot;
          document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          updateSelectedDisplay();
          updateContinueBtn();
        });
      }
      container.appendChild(btn);
    });
  }

  function updateSelectedDisplay() {
    const disp = document.getElementById('selectedDisplay');
    const txt  = document.getElementById('selectedText');
    if (selectedDate && selectedTime) {
      const d = new Date(selectedDate + 'T00:00:00');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      txt.textContent = `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} at ${selectedTime}`;
      disp.style.display = 'flex';
    } else {
      disp.style.display = 'none';
    }
  }

  function updateContinueBtn() {
    document.getElementById('toStep2Btn').disabled = !(selectedDate && selectedTime);
    updateSelectedDisplay();
  }

  function getFormattedDateTime() {
    const d = new Date(selectedDate + 'T00:00:00');
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${currentYear} at ${selectedTime}`;
  }

  // -- Navigation --
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar();
  });
  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  });

  document.getElementById('toStep2Btn').addEventListener('click', () => {
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    document.getElementById('schedRecap').textContent = getFormattedDateTime();
    setStep(2);
  });

  document.getElementById('backToStep1').addEventListener('click', () => {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step1').style.display = 'block';
    setStep(1);
  });

  function setStep(n) {
    [1,2,3].forEach(i => {
      const el = document.getElementById('step-ind-' + i);
      el.classList.remove('active','done');
      if (i === n) el.classList.add('active');
      if (i < n)  el.classList.add('done');
    });
  }

  // -- Submit --
  document.getElementById('submitBtn').addEventListener('click', async () => {
    const fname   = document.getElementById('sFname').value.trim();
    const lname   = document.getElementById('sLname').value.trim();
    const email   = document.getElementById('sEmail').value.trim();
    const phone   = document.getElementById('sPhone').value.trim();
    const service = document.getElementById('sService').value;
    const hood    = document.getElementById('sHood').value;
    const notes   = document.getElementById('sNotes').value.trim();
    const errEl   = document.getElementById('formError');

    errEl.style.display = 'none';

    if (!fname || !lname || !email || !phone || !service || !hood) {
      errEl.textContent = 'Please fill in all required fields before confirming.';
      errEl.style.display = 'block';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errEl.textContent = 'Please enter a valid email address.';
      errEl.style.display = 'block';
      return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Sending confirmation...';

    const datetime = getFormattedDateTime();
    const templateParams = {
      to_name:   fname,
      to_email:  email,
      full_name: `${fname} ${lname}`,
      phone,
      service,
      neighborhood: hood,
      datetime,
      notes: notes || 'None',
    };

    try {
      if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      }
      showConfirmation(fname, datetime, service, hood, email);
    } catch (err) {
      console.error('EmailJS error:', err);
      // Still show confirmation — don't block the UX on email failure
      showConfirmation(fname, datetime, service, hood, email);
    }
  });

  function showConfirmation(fname, datetime, service, hood, email) {
    document.getElementById('step2').style.display = 'none';
    document.getElementById('step3').style.display = 'block';
    setStep(3);

    document.getElementById('confirmMsg').textContent =
      `Thanks, ${fname}! Your free estimate appointment is confirmed. We'll see you soon.`;

    document.getElementById('confirmDetails').innerHTML = `
      <strong>📅 Date &amp; Time:</strong> ${datetime}<br>
      <strong>🏠 Service:</strong> ${service}<br>
      <strong>📍 Neighborhood:</strong> ${hood}<br>
      <strong>📧 Confirmation sent to:</strong> ${email}
    `;
  }

  // Init
  window.addEventListener('load', () => {
    toggleCleanType();
    updatePrice();
    renderCalendar();
  });
})();
