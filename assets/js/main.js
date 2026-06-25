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

  let priceRange;
  let detailsText = '';

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
    
    if (cleanType === 'deep') {
      document.getElementById('cleanType').value = 'standard';
    }
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

document.getElementById('freq').addEventListener('change', () => {
  toggleCleanType();
  updatePrice();
});

document.getElementById('homeSize').addEventListener('change', updatePrice);
document.getElementById('cleanType').addEventListener('change', updatePrice);

window.addEventListener('load', () => {
  toggleCleanType();
  updatePrice();
});
