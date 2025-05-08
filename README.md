# 🏨 Hotel Booking Web Application

This is a hotel booking web application built using **Node.js**, **Express.js**, **PostgreSQL**, and **Handlebars (hbs)** as the view engine. Users can book rooms, fill in their personal details, make payments, and receive booking confirmations.

---

## 🚀 Features

- Multi-step hotel booking process
- Room selection and availability tracking
- Guest detail collection and validation
- Payment confirmation
- Booking reference generation
- Stores bookings in a PostgreSQL database
- Clean UI using Handlebars and custom CSS

---

## 📁 Project Structure

<pre> <code> ```plaintext hotel-booking-app/ │ ├── src/ │ ├── models/ # Database model logic │ │ ├── guest.js │ │ └── booking.js │ │ │ ├── db/ │ │ └── conn.js # PostgreSQL DB connection │ │ │ ├── .env # Environment variables │ ├── package.json │ ├── package-lock.json │ └── app.js # Main Express app │ ├── templates/ │ ├── partials/ # Handlebars partials │ │ ├── navbar.hbs │ │ └── footer.hbs │ │ │ └── views/ # Handlebars views/pages │ ├── index.hbs │ ├── personal.hbs │ ├── payment.hbs │ └── confirmation.hbs │ ├── public/ # Static frontend files │ ├── js/ │ │ └── main.js │ └── css/ │ └── style.css ``` </code> </pre>

---

## 🧱 Database Schema

### `guests` table

| Column     | Type               |
|------------|--------------------|
| id         | SERIAL PRIMARY KEY |
| first_name | VARCHAR            |
| last_name  | VARCHAR            |
| email      | VARCHAR            |
| phone      | VARCHAR            |

### `rooms` table

| Column       | Type                         |
|--------------|------------------------------|
| room_number  | VARCHAR PRIMARY KEY           |
| room_type    | VARCHAR                      |
| status       | VARCHAR (e.g., available/unavailable) |

### `bookings` table

| Column            | Type               |
|-------------------|--------------------|
| id                | SERIAL PRIMARY KEY |
| booking_reference | VARCHAR            |
| payment_amount    | NUMERIC            |
| payment_date      | DATE               |
| payment_method    | VARCHAR            |

---

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/hotel-booking-app.git
   cd hotel-booking-app/src
Install dependencies

bash
Copy
Edit
npm install
Create a .env file in src/ with the following:

ini
Copy
Edit
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=hotel_booking
Set up PostgreSQL database

Create the tables as described in the schema above.

Insert initial room data.

Run the server

bash
Copy
Edit
node app.js
Visit the app

arduino
Copy
Edit
http://localhost:3000
📩 API Endpoints
POST /api/guest – Saves guest details

POST /api/bookings – Saves booking and updates room status

📌 Future Enhancements
Email notification system

Admin dashboard to view bookings

Room image previews

Multi-language support

🛠 Technologies Used
Node.js

Express.js

PostgreSQL

Handlebars (hbs)

HTML/CSS/JavaScript

dotenv

🙌 Acknowledgments
Thanks to all open-source tools and libraries that made this project possible!

We welcome contributions to make this project better! If you’d like to contribute, please follow these steps:

Fork the repository.

Create a branch for your feature or bug fix:

bash
Copy
Edit
git checkout -b feature-name
Commit your changes with clear messages.

Push to your forked repository.

Open a Pull Request describing what you changed and why.

Please make sure your code follows our existing style and includes relevant comments and documentation.

If you're new to open source, feel free to open an issue or ask questions — we're happy to help!



📄 License
This project is open source and available under the MIT License.
