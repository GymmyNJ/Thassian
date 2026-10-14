// Pricing model based on research and shop assumptions
const weights = {
    5: 1.28, 6: 1.54, 7: 1.79, 8: 2.05, 9: 2.31,
    10: 2.57, 11: 2.82, 12: 3.08, 13: 3.34, 14: 3.59,
    15: 3.84, 16: 4.11
};

const MATERIAL_PER_LB = 0.55;
const LABOR_PER_FT = 114 / 120; // $0.95/ft
const MARKUP = 1.75;

const diameterSelect = document.getElementById('diameter');
const lengthInput = document.getElementById('length');
const calculateBtn = document.getElementById('calculate');
const resultsDiv = document.getElementById('results');
const orderFormDiv = document.getElementById('order-form');
const orderForm = document.getElementById('order');
const successDiv = document.getElementById('success');

let currentQuote = null;

calculateBtn.addEventListener('click', calculateQuote);
lengthInput.addEventListener('input', () => {
    if (!resultsDiv.classList.contains('hidden')) calculateQuote();
});
diameterSelect.addEventListener('change', () => {
    if (!resultsDiv.classList.contains('hidden')) calculateQuote();
});

function calculateQuote() {
    const dia = parseInt(diameterSelect.value);
    const length = parseFloat(lengthInput.value);

    if (!length || length < 1) {
        alert('Please enter a valid length (minimum 1 foot).');
        return;
    }

    const wtPerFt = weights[dia];
    const materialTotal = (wtPerFt * MATERIAL_PER_LB) * length;
    const laborTotal = LABOR_PER_FT * length;
    const subtotal = materialTotal + laborTotal;
    const total = subtotal * MARKUP;
    const prodMinutes = (length / 10) * 5;

    document.getElementById('mat-cost').textContent = '$' + materialTotal.toFixed(2);
    document.getElementById('labor-cost').textContent = '$' + laborTotal.toFixed(2);
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
    document.getElementById('prod-time').textContent = Math.round(prodMinutes) + ' min';

    resultsDiv.classList.remove('hidden');
    orderFormDiv.classList.remove('hidden');

    currentQuote = {
        diameter: dia,
        length,
        material: materialTotal,
        labor: laborTotal,
        total,
        minutes: Math.round(prodMinutes)
    };
}

orderForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentQuote) return;

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const company = document.getElementById('company').value || 'N/A';
    const address = document.getElementById('address').value || 'N/A';
    const notes = document.getElementById('notes').value || 'None';

    const subject = encodeURIComponent(
        `Spiral Duct Order — ${currentQuote.diameter}" × ${currentQuote.length} ft`
    );

    const body = encodeURIComponent(
`New Spiral Duct Order Request

Customer: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company}
Delivery Address: ${address}

Order Details:
• Diameter: ${currentQuote.diameter}"
• Length: ${currentQuote.length} ft
• Material: $${currentQuote.material.toFixed(2)}
• Labor: $${currentQuote.labor.toFixed(2)}
• Total Quote: $${currentQuote.total.toFixed(2)}
• Est. Production Time: ${currentQuote.minutes} minutes

Notes: ${notes}

Customer has accepted the quote. Please confirm and begin production.
`
    );

    window.location.href = `mailto:office@thassian.com?subject=${subject}&body=${body}`;

    successDiv.classList.remove('hidden');
    orderForm.reset();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

window.addEventListener('load', calculateQuote);