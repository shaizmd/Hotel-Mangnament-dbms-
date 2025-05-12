// const express = require('express');
// const app = express();

// const bodyParser = require('body-parser');
// const Guest = require('./models/guest');

// app.use(express.json()); // Make sure this middleware is active

// app.post('/submit-guest', async (req, res) => {
//   const { fname, lname, email, phone_no } = req.body;

//   try {
//     const newGuest = await Guest.create(fname, lname, email, phone_no);
//     res.status(200).json(newGuest);
//   } catch (error) {
//     console.error('Error saving guest:', error);
//     res.status(500).json({ message: 'Error saving guest' });
//   }
// });




// app.post('/api/bookings', async (req, res) => {
//   try {
//     const {
//       bookingReference,
//       paymentAmount,
//       paymentDate,
//       paymentMethod,
//       guestEmail,
//       roomNumber
//     } = req.body;

//     // Fetch guest ID using guest email
//     const guestResult = await pool.query('SELECT guest_id FROM guests WHERE email = $1', [guestEmail]);
//     if (guestResult.rows.length === 0) {
//       return res.status(400).json({ message: 'Guest not found' });
//     }

//     const guestId = guestResult.rows[0].guest_id;

//     // Insert booking
//     const insertQuery = `
//       INSERT INTO bookings 
//       (booking_reference, guest_id, room_number, payment_amount, payment_date, payment_method)
//       VALUES ($1, $2, $3, $4, $5, $6)
//     `;
//     await pool.query(insertQuery, [
//       bookingReference,
//       guestId,
//       roomNumber,
//       paymentAmount,
//       paymentDate,
//       paymentMethod
//     ]);

//     // Mark room as unavailable
//     await pool.query('UPDATE rooms SET status = $1 WHERE room_number = $2', ['unavailable', roomNumber]);

//     res.status(200).json({ message: 'Booking saved successfully' });
//   } catch (error) {
//     console.error('Error saving booking:', error);
//     res.status(500).json({ message: 'Failed to save booking' });
//   }
// });



// const hbs = require('hbs');
// const path = require('path');
// const { title } = require('process');

// const PORT = process.env.PORT || 3000;


// const staticPath = path.join(__dirname, '../public');
// app.use(express.static(staticPath));

// hbs.registerPartials(path.join(__dirname, '../templates/partials'));

// const pool = require('./db/conn'); // adjust the path if needed


// // Set up handlebars
// app.set('view engine', 'hbs');
// app.set('views', path.join(__dirname, '../templates/views'));

// app.get('/', (req, res) => {
//     res.render('index',{title: 'Home'});
// }
// )
// app.get('/personal', (req, res) => {
//     res.render('personal',{title: 'Personal Information'})
// });

// app.get('/payment', (req, res) => {
//     res.render('payment',{title: 'Payment Information'});
// });
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//   });





const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const pool = require('./db/conn');
const Guest = require('./models/guest');
const { createBooking } = require('./models/booking');

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Static files setup
const staticPath = path.join(__dirname, '../public');
app.use(express.static(staticPath));

// Handlebars setup
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates/views'));
hbs.registerPartials(path.join(__dirname, '../templates/partials'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
});

app.get('/personal', (req, res) => {
    res.render('personal', { title: 'Personal Information' });
});

app.get('/payment', (req, res) => {
    res.render('payment', { title: 'Payment Information' });
});

// API Endpoints
app.post('/submit-guest', async (req, res) => {
  const { fname, lname, email, phone_no } = req.body;

  try {
    const newGuest = await Guest.create(fname, lname, email, phone_no);
    res.status(200).json(newGuest);
  } catch (error) {
    console.error('Error saving guest:', error);
    res.status(500).json({ message: 'Error saving guest', error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    console.log('=== BOOKING REQUEST RECEIVED ===');
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
    
    const {
      bookingReference,
      paymentAmount,
      paymentDate,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!bookingReference) {
      console.log('Missing booking reference');
      return res.status(400).json({ message: 'Missing booking reference' });
    }
    
    // Directly insert into the database instead of using a separate function
    // This helps us identify any schema issues more directly
    try {
      const insertQuery = `
        INSERT INTO bookings (booking_reference, payment_amount, payment_date, payment_method)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      console.log('Executing query:', insertQuery);
      console.log('With parameters:', [
        bookingReference,
        paymentAmount || 0,
        paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod || 'Not specified'
      ]);
      
      const result = await pool.query(insertQuery, [
        bookingReference,
        paymentAmount || 0,
        paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod || 'Not specified'
      ]);
      
      const newBooking = result.rows[0];
      console.log('Booking created successfully:', newBooking);
      
      res.status(200).json({ 
        message: 'Booking saved successfully',
        booking: newBooking
      });
    } catch (dbError) {
      console.error('DATABASE ERROR:', dbError);
      
      // Provide more specific error based on common database issues
      let errorMessage = 'Failed to save booking to database';
      
      if (dbError.code === '42P01') {
        errorMessage = 'Table does not exist. Please check your database schema.';
      } else if (dbError.code === '42703') {
        errorMessage = 'Column not found. Your database schema may be out of date.';
      } else if (dbError.code === '23502') {
        errorMessage = 'Not-null constraint violation. A required column is missing.';
      } else if (dbError.code === '23503') {
        errorMessage = 'Foreign key constraint violation. Referenced row may not exist.';
      }
      
      res.status(500).json({ 
        message: errorMessage,
        error: dbError.message,
        code: dbError.code
      });
    }
  } catch (error) {
    console.error('GENERAL ERROR IN BOOKING ROUTE:', error);
    res.status(500).json({ 
      message: 'Failed to process booking request', 
      error: error.message
    });
  }
});
// Enhanced error handler
app.use((err, req, res, next) => {
  console.error('Unhandled application error:', err);
  res.status(500).json({
    message: 'Server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});





const RoomInfo = require('./models/roominfo');

app.use(express.json());

app.post('/submit-roominfo', async (req, res) => {
  const { room_type, check_in, check_out, no_of_guests, room_rate } = req.body;

  try {
    const result = await RoomInfo.saveRoomInfo(room_type, check_in, check_out, no_of_guests, room_rate);
    res.status(200).json({ message: 'Room info saved successfully', id: result.id });
  } catch (err) {
    console.error('Error saving room info:', err);
    res.status(500).json({ message: 'Error saving room info' });
  }
});


// Server initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Debug mode enabled - full request logging is active`);
});