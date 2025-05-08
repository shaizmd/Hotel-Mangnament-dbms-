const pool = require('../db/conn');

async function createBooking(bookingData) {
  const {
    bookingReference,
    guestId,
    roomNumber,
    paymentAmount,
    paymentDate,
    paymentMethod
  } = bookingData;

  // Match the exact schema of your database
  const query = `
    INSERT INTO bookings (
      booking_reference,
      guest_id,
      room_number,
      payment_amount,
      payment_date,
      payment_method
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [
    bookingReference,
    guestId,
    roomNumber,
    paymentAmount,
    paymentDate,
    paymentMethod
  ];

  try {
    const result = await pool.query(query, values);

    // Update room status - make sure room_number is an integer if that's what your schema requires
    await pool.query(
      `UPDATE rooms SET status = 'unavailable' WHERE room_number = $1`,
      [parseInt(roomNumber, 10)] // Convert to integer if needed
    );

    return result.rows[0];
  } catch (err) {
    console.error('Error inserting booking:', err);
    throw err;
  }
}

module.exports = {
  createBooking
};