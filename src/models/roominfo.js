const pool = require('../db/conn');

const RoomInfo = {
  saveRoomInfo: async (room_type, check_in, check_out, no_of_guests, room_rate) => {
    const insertQuery = `
      INSERT INTO roominfo (room_type, check_in, check_out, no_of_guests, room_rate)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `;
    const values = [room_type, check_in, check_out, no_of_guests, room_rate];
    const result = await pool.query(insertQuery, values);
    return result.rows[0];
  }
};

module.exports = RoomInfo;
