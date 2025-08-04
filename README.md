# Yuri's Closet Inventory System

This repository contains a simple inventory‑management and point‑of‑sale (POS) web application for **Yuri's Closet**, designed to run entirely on GitHub Pages.  The goal is to provide store workers with an easy way to record sales — including the amount paid and any change due — and to give the owner (the admin) a private dashboard for tracking stock levels and daily sales totals.  The aesthetic is inspired by green, gold and soft pink tones and features a custom floral logo to reflect the warm and chic vibe of Yuri's Closet.

## Features

### Worker Interface (`index.html`)

- **View Current Inventory:**  See how many items remain at two fixed price points – ₱69 and ₱99.
- **Record Sales:**  Workers can quickly record a sale by selecting the price and quantity sold **and entering the amount of money received**.  The app automatically deducts stock, logs the sale with a timestamp and calculates the customer’s change.
- **Validation:**  The form prevents recording more items than are currently in stock and provides helpful messages when something is amiss.
- **Local Persistence:**  Inventory counts and sales history are stored in the browser’s `localStorage`, so data persists between page reloads on the same machine.

### Admin Interface (`admin.html`)

- **Secure Login:**  A basic password prompt restricts dashboard access to the administrator.  (The default password is `yuriadmin` – please change it before deploying by editing `script.js`.)
- **Manage Stock:**  Easily add new items to the ₱69 or ₱99 inventory.
- **Purchase History:**  View a table of all recorded sales, including date/time, price, quantity, and transaction total.
- **Daily Gross Sales:**  The dashboard aggregates sales by date and displays the total revenue for each day.
- **Export CSV:**  Download the complete sales log as a CSV file for accounting and analysis.
- **Ideas for Enhancement:**  The admin page lists several suggested improvements for future versions, such as adding user accounts and generating charts.

## How It Works

The application is fully client‑side and uses HTML, CSS, and vanilla JavaScript.  It stores data in the browser’s `localStorage` under the keys `inventory69`, `inventory99`, and `salesRecords`.  When a worker records a sale, the relevant inventory value is decreased and the sale is appended to `salesRecords`.  The admin page reads these values, displays them in tables, and allows stock adjustments.

Because GitHub Pages does not support a server‑side backend, this approach is suitable for demonstration purposes or situations where the same computer will be used for data entry.  For a multi‑user deployment, you may consider integrating a backend (e.g. a lightweight database with an API) or a cloud service such as Firebase.

## Getting Started

### 1. Deploy to GitHub Pages

1. **Create a new repository** on GitHub (e.g. `yuris-closet`).
2. Clone the repository locally or use the GitHub web UI to upload the files from this folder (`index.html`, `admin.html`, `style.css`, `script.js`, `README.md`).  The entire `yuris-closet-website` directory structure should be at the root of your repository.
3. Commit and push the changes.
4. In your repository’s settings, scroll to **Pages**.  Choose the `main` branch and set the root folder (`/`) as the source.  Save your settings and GitHub will publish your site at `https://<username>.github.io/<repository>/`.

### 2. Initialize Inventory

By default the inventory counts start at zero.  As the administrator, log in to the admin dashboard and use the **Add Stock** form to enter your current stock for the ₱69 and ₱99 items.

### 3. Customize

- **Change the Admin Password:**  Open `script.js` and modify the `ADMIN_PASSWORD` constant.  Do not commit your real password to a public repository.  Instead, consider using environment variables or a simple obfuscation method if you need to share the code.
- **Add More Price Points:**  The current system assumes only two fixed prices.  To support additional prices, extend the inventory functions and adjust the forms accordingly.
- **Enhance Styling:**  All colors are defined at the top of `style.css` using CSS variables.  Feel free to tweak the palette to better match your brand.

## Suggested Future Improvements

- **User Accounts:**  Implement worker accounts with individual logins to track who recorded each sale.
- **Inventory Categories:**  Track stock by item type, size, or color for more granular reporting.
- **Responsive Charts:**  Visualize daily or weekly sales trends using chart libraries (e.g. Chart.js).
- **Persistent Backend:**  Integrate with a backend service (such as Firebase or Supabase) to sync data across multiple devices and maintain consistency.

## License

This project is released under the MIT License.  Feel free to use, modify, and distribute it as you see fit.