const pool = require('../db/conn');

const Guest = {
  create: async (fname, lname, email, phone_no) => {
    const query = `
      INSERT INTO guests (fname, lname, email, phone_no)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [fname, lname, email, phone_no];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
};

module.exports = Guest;
