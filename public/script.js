// Pricing model
const weights = {
    5: 1.28, 6: 1.54, 7: 1.79, 8: 2.05, 9: 2.31,
    10: 2.57, 11: 2.82, 12: 3.08, 13: 3.34, 14: 3.59,
    15: 3.84, 16: 4.11
};

const MATERIAL_PER_LB = 0.55;
const LABOR_PER_FT = 114 / 120;
const MARKUP = 1.75;

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
    const notes = document.getElementById('notes').value || 'None';

    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

    let itemsText = '';
    items.forEach((item, idx) => {
        itemsText += `${idx + 1}. ${item.qty} × ${item.dia}″ × ${item.len} ft\n`;
    });

    const subject = encodeURIComponent(`Spiral Duct Order — $${total.toFixed(2)}`);
    const body = encodeURIComponent(
`New Spiral Duct Order (Union Shop)

Customer: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}
Delivery Address: ${address}

Order Items:
${itemsText}
TOTAL QUOTE: $${total.toFixed(2)}

Notes: ${notes}

Customer accepts the quote. Please confirm and begin production.
`
    );

    window.location.href = `mailto:office@thassian.com?subject=${subject}&body=${body}`;
    successDiv.classList.remove('hidden');
});

// Start with one empty line
addLine(8, 10, 1);