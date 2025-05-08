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
      paymentMethod,
      guestEmail,
      roomNumber
    } = req.body;

    // Validate required fields
    if (!bookingReference) {
      console.log('Missing booking reference');
      return res.status(400).json({ message: 'Missing booking reference' });
    }
    
    if (!guestEmail) {
      console.log('Missing guest email');
      return res.status(400).json({ message: 'Missing guest email' });
    }
    
    if (!roomNumber) {
      console.log('Missing room number');
      return res.status(400).json({ message: 'Missing room number' });
    }

    console.log('Checking for guest with email:', guestEmail);
    
    try {
      // Check if the guest exists - note that your schema likely has 'id' not 'guest_id'
      const guestResult = await pool.query('SELECT id FROM guests WHERE email = $1', [guestEmail]);
      console.log('Guest query result:', guestResult.rows);
      
      let guestId;
      
      if (guestResult.rows.length === 0) {
        // Guest doesn't exist, let's create one
        console.log(`Guest with email ${guestEmail} not found. Creating a new guest entry.`);
        
        // Extract name from email if possible
        const emailParts = guestEmail.split('@');
        const defaultName = emailParts[0] || 'Guest';
        
        const newGuestQuery = `
          INSERT INTO guests (fname, lname, email, phone_no)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `;
        
        console.log('Creating new guest with query:', newGuestQuery);
        console.log('Parameters:', [defaultName, 'Guest', guestEmail, 'Not provided']);
        
        const guestInsertResult = await pool.query(newGuestQuery, [
          defaultName,   // First name (placeholder)
          'Guest',       // Last name (placeholder)
          guestEmail,
          'Not provided' // Phone (placeholder)
        ]);
        
        console.log('New guest created:', guestInsertResult.rows[0]);
        guestId = guestInsertResult.rows[0].id; // Use 'id' not 'guest_id'
      } else {
        guestId = guestResult.rows[0].id; // Use 'id' not 'guest_id'
        console.log('Found existing guest ID:', guestId);
      }

      console.log('Checking if room exists:', roomNumber);
      
      try {
        // Make sure roomNumber is an integer if that's what your schema requires
        const roomNumberInt = parseInt(roomNumber, 10);
        
        // Check if the rooms table has the room
        const roomCheckResult = await pool.query('SELECT * FROM rooms WHERE room_number = $1', [roomNumberInt]);
        console.log('Room check result:', roomCheckResult.rows);
        
        if (roomCheckResult.rows.length === 0) {
          // Room doesn't exist, create it
          console.log(`Room ${roomNumberInt} not found. Creating a new room entry.`);
          
          const createRoomQuery = `
            INSERT INTO rooms (room_number, room_type, price, status)
            VALUES ($1, $2, $3, $4)
          `;
          
          console.log('Creating room with query:', createRoomQuery);
          console.log('Parameters:', [roomNumberInt, 'Standard', 0, 'available']);
          
          await pool.query(createRoomQuery, [roomNumberInt, 'Standard', 0, 'available']);
          console.log('Room created successfully');
        }

        // Use the booking service function with the correct schema
        const bookingData = {
          bookingReference,
          guestId,
          roomNumber: roomNumberInt, // Ensure it's an integer
          paymentAmount: paymentAmount || 0,
          paymentDate: paymentDate || new Date().toISOString().split('T')[0],
          paymentMethod: paymentMethod || 'Not specified'
        };
        
        console.log('Creating booking with data:', JSON.stringify(bookingData, null, 2));
        
        try {
          const newBooking = await createBooking(bookingData);
          console.log('Booking created successfully:', newBooking);
          
          res.status(200).json({ 
            message: 'Booking saved successfully',
            booking: newBooking
          });
        } catch (bookingError) {
          console.error('ERROR CREATING BOOKING:', bookingError);
          res.status(500).json({ 
            message: 'Failed to save booking', 
            error: bookingError.message,
            details: bookingError.stack
          });
        }
      } catch (roomError) {
        console.error('ERROR CHECKING/CREATING ROOM:', roomError);
        res.status(500).json({ 
          message: 'Failed to check/create room', 
          error: roomError.message,
          details: roomError.stack
        });
      }
    } catch (guestError) {
      console.error('ERROR CHECKING/CREATING GUEST:', guestError);
      res.status(500).json({ 
        message: 'Failed to check/create guest', 
        error: guestError.message,
        details: guestError.stack
      });
    }
  } catch (error) {
    console.error('GENERAL ERROR IN BOOKING ROUTE:', error);
    res.status(500).json({ 
      message: 'Failed to process booking request', 
      error: error.message,
      details: error.stack
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

// Server initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Debug mode enabled - full request logging is active`);
});