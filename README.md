# Thassian Mechanical — Custom Spiral Duct Site

Professional static website for custom spiral duct quotes and orders.

## Structure for GitHub + Render

```
/
├── public/                 ← Static site root (publish this)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── logo.jpg
│   ├── spiral-hero.jpg
│   └── spiral-machine.jpg
├── render.yaml             ← Render blueprint (optional)
└── README.md
```

## Deploy to Render (Static Site)

1. Push this repo to GitHub.
2. In Render: **New → Static Site** → Connect the GitHub repo.
3. Settings:
   - **Build Command**: (leave blank)
   - **Publish Directory**: `public`
4. Deploy. Render will serve `public/index.html` as the root.

Alternatively, use the included `render.yaml` as a Blueprint for one-click setup.

## Pricing Model (adjust in `public/script.js`)

- Labor: $114/hr ÷ 120 ft/hr = **$0.95/ft**
- Material: 26-ga weights × **$0.55/lb**
- Markup: **1.75×** on direct cost

Edit the three constants at the top of `script.js` to match your exact costs and desired margin.

## Notes

- Fully static — no backend required.
- Order acceptance uses a `mailto:` link so the customer’s email client sends the order to `office@thassian.com`.
- Update the email address and phone in `index.html` and `script.js` if needed.
- Images are included. Replace with your own shop photos when available.