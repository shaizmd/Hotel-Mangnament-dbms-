const pool = require('../db/conn');

async function createBooking(bookingData) {
  const {
    bookingReference,
    paymentAmount,
    paymentDate,
    paymentMethod
  } = bookingData;
  
  // Match the exact schema of your updated database
  const query = `
    INSERT INTO bookings (
      booking_reference,
      payment_amount,
      payment_date,
      payment_method
    ) VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  
  const values = [
    bookingReference,
    paymentAmount,
    paymentDate,
    paymentMethod
  ];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (err) {
    console.error('Error inserting booking:', err);
    throw err;
  }
}

module.exports = {
  createBooking
};