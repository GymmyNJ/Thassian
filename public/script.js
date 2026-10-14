// Pricing model
const weights = {
    5: 1.28, 6: 1.54, 7: 1.79, 8: 2.05, 9: 2.31,
    10: 2.57, 11: 2.82, 12: 3.08, 13: 3.34, 14: 3.59,
    15: 3.84, 16: 4.11
};

const MATERIAL_PER_LB = 0.55;
const LABOR_PER_FT = 114 / 120;
const MARKUP = 2.25;

const lineItemsContainer = document.getElementById('line-items');
const addLineBtn = document.getElementById('add-line');
const grandTotalEl = document.getElementById('grand-total');
const orderForm = document.getElementById('order');
const successDiv = document.getElementById('success');

let lineId = 0;

function createDiameterOptions(selected = 8) {
    let html = '';
    for (let d = 5; d <= 16; d++) {
        html += `<option value="${d}" ${d === selected ? 'selected' : ''}>${d}″</option>`;
    }
    return html;
}

function addLine(dia = 8, length = 10, qty = 1) {
    lineId++;
    const row = document.createElement('div');
    row.className = 'line-row';
    row.dataset.id = lineId;
    row.innerHTML = `
        <div>
            <label>Diameter</label>
            <select class="dia">${createDiameterOptions(dia)}</select>
        </div>
        <div>
            <label>Length (ft each)</label>
            <input type="number" class="len" min="1" step="1" value="${length}">
        </div>
        <div>
            <label>Qty</label>
            <input type="number" class="qty" min="1" step="1" value="${qty}">
        </div>
        <button type="button" class="remove-btn" title="Remove">×</button>
    `;
    lineItemsContainer.appendChild(row);

    row.querySelector('.remove-btn').addEventListener('click', () => {
        if (lineItemsContainer.children.length > 1) {
            row.remove();
            updateTotal();
        }
    });

    row.querySelectorAll('select, input').forEach(el => {
        el.addEventListener('input', updateTotal);
        el.addEventListener('change', updateTotal);
    });

    updateTotal();
}

function getLineTotal(dia, length, qty) {
    const wtPerFt = weights[dia];
    const material = wtPerFt * MATERIAL_PER_LB * length * qty;
    const labor = LABOR_PER_FT * length * qty;
    return (material + labor) * MARKUP;
}

function updateTotal() {
    let grand = 0;
    const rows = lineItemsContainer.querySelectorAll('.line-row');
    rows.forEach(row => {
        const dia = parseInt(row.querySelector('.dia').value);
        const len = parseFloat(row.querySelector('.len').value) || 0;
        const qty = parseInt(row.querySelector('.qty').value) || 0;
        if (len > 0 && qty > 0) {
            grand += getLineTotal(dia, len, qty);
        }
    });
    grandTotalEl.textContent = '$' + grand.toFixed(2);
}

function collectOrder() {
    const items = [];
    lineItemsContainer.querySelectorAll('.line-row').forEach(row => {
        const dia = parseInt(row.querySelector('.dia').value);
        const len = parseFloat(row.querySelector('.len').value) || 0;
        const qty = parseInt(row.querySelector('.qty').value) || 0;
        if (len > 0 && qty > 0) {
            items.push({ dia, len, qty, lineTotal: getLineTotal(dia, len, qty) });
        }
    });
    return items;
}

addLineBtn.addEventListener('click', () => addLine());

orderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const items = collectOrder();
    if (items.length === 0) {
        alert('Please add at least one piece with a valid length and quantity.');
        return;
    }

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const company = document.getElementById('company').value || 'N/A';
    const address = document.getElementById('address').value || 'N/A';
    const jobname = document.getElementById('jobname').value || 'No Job Name';
    const notes = document.getElementById('notes').value || 'None';

    // Sort by diameter (ascending), then by length
    items.sort((a, b) => {
        if (a.dia !== b.dia) return a.dia - b.dia;
        return a.len - b.len;
    });

    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

    // Production-friendly item list
    let itemsText = '';
    items.forEach((item, idx) => {
        itemsText += `${String(idx + 1).padStart(2, ' ')}.  ${String(item.qty).padStart(3)} pcs   ${String(item.dia).padStart(2)}″   ×   ${String(item.len).padStart(4)} ft\n`;
    });

    const orderDetails = 
`THASSIAN MECHANICAL — SPIRAL DUCT ORDER
========================================
JOB NAME:     ${jobname}
TOTAL QUOTE:  $${total.toFixed(2)}
========================================

CUSTOMER
--------
Name:     ${name}
Phone:    ${phone}
Email:    ${email}
Company:  ${company}
Address:  ${address}

ORDER ITEMS (sorted by size)
----------------------------
${itemsText}
========================================
TOTAL: $${total.toFixed(2)}

EXTRA INFORMATION / COMMENTS
----------------------------
${notes}

========================================
Customer has accepted the quote.
Please confirm by text and email, then begin production.`;

    // Put the formatted order into the hidden field
    document.getElementById('order-details').value = orderDetails;
    document.getElementById('email-subject').value = `SPIRAL ORDER — ${jobname} — $${total.toFixed(2)}`;

    const submitBtn = orderForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Submit the form via Formspree
    const formData = new FormData(orderForm);
    fetch(orderForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    })
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
        if (ok) {
            orderForm.classList.add('hidden');
            successDiv.classList.remove('hidden');
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            const msg = data.errors ? data.errors.map(e => e.message).join(', ') : 'Unknown error';
            alert('Order could not be sent: ' + msg + '\n\nPlease check your Formspree dashboard and make sure the form is activated.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    })
    .catch(err => {
        alert('Network error sending the order. Please try again or call us.\n\n' + err.message);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
});

// Start with one empty line
addLine(8, 10, 1);