// Main entry point - runs when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // console.log('DOM fully loaded');
  
  // Initialize UI components
  initDatePicker();
  initNavbarSearch();
  
  // Loading data based on current page
  if (isRoomSelectionPage()) {
    initRoomSelection();
    populateRoomSelectionData();
  } else if (isPersonalDetailsPage()) {
    initPersonalDetailsForm();
    populatePersonalDetailsData();
  } else if (isPaymentPage()) {
    initPaymentForm();
    populatePaymentData();
  }
  
  // Initialize navbar search with saved data
  loadSavedSearchData();
});

// ===== PAGE DETECTION HELPERS =====
function isRoomSelectionPage() {
  // Check for room selection page elements
  return document.querySelectorAll('.select').length > 0 && 
         document.querySelector('.your-stay') !== null;
}

function isPersonalDetailsPage() {
  return document.getElementById('personal-details-form') !== null;
}

function isPaymentPage() {
  return document.getElementById('payment-form') !== null;
}

// ===== DATA STORAGE FUNCTIONS =====
function saveBookingData(key, data) {
  try {
    // Check if we need to merge with existing data
    const existingData = getBookingData(key);
    const updatedData = existingData ? { ...existingData, ...data } : data;
    localStorage.setItem(key, JSON.stringify(updatedData));
    // console.log(`Saved ${key} data:`, updatedData);
    return true;
  } catch (error) {
    // console.error(`Error saving ${key} data:`, error);
    return false;
  }
}

function getBookingData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    // console.error(`Error retrieving ${key} data:`, error);
    return null;
  }
}

// Comprehensive booking data function - combines all booking data for consistent access
function getAllBookingData() {
  return {
    search: getBookingData('searchData') || {},
    room: getBookingData('roomSelection') || {},
    personal: getBookingData('personalDetails') || {},
    confirmation: getBookingData('bookingConfirmation') || {}
  };
}

// ===== NAVBAR SEARCH FUNCTIONALITY =====
function initNavbarSearch() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;
  
  // console.log('Navbar search detected');
  
  // Get all interactive elements in the search bar
  const hotelSelect = searchBar.querySelector('select[aria-label="Hotel Selection"]');
  const guestsSelect = searchBar.querySelector('select[aria-label="Number of Guests"]');
  const roomsSelect = searchBar.querySelector('select[aria-label="Number of Rooms"]');
  const specialCodeInput = searchBar.querySelector('input[placeholder="Special Code"]');
  const searchBtn = searchBar.querySelector('.search-btn');
  
  // Add event listeners to each element to save its value when changed
  [hotelSelect, guestsSelect, roomsSelect, specialCodeInput].forEach(element => {
    if (element) {
      element.addEventListener('change', saveSearchData);
    }
  });
  
  // Add click handler for search button
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      saveSearchData();
      // Navigate to rooms page
      // console.log('Search button clicked, data saved');
      
      // If on homepage, navigate to rooms page
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = '/rooms';
      }
    });
  }
}

// Function to save all search bar data to localStorage
function saveSearchData() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;
  
  const searchData = {
    hotel: searchBar.querySelector('select[aria-label="Hotel Selection"]')?.value || 'Taj Cidade de Goa Heritage',
    dateRange: document.getElementById('date-range')?.value || '',
    dates: extractDatesFromRange(document.getElementById('date-range')?.value),
    guests: searchBar.querySelector('select[aria-label="Number of Guests"]')?.value || '2 Guests',
    rooms: searchBar.querySelector('select[aria-label="Number of Rooms"]')?.value || '1 Room',
    specialCode: searchBar.querySelector('input[placeholder="Special Code"]')?.value || '',
    // Calculate nights from date range
    nights: calculateNights(document.getElementById('date-range')?.value)
  };
  
  saveBookingData('searchData', searchData);
}

// Helper function to extract check-in and check-out dates from range
function extractDatesFromRange(dateRange) {
  if (!dateRange) return { checkIn: '2025-05-10', checkOut: '2025-05-13' };
  
  const dates = dateRange.split(' to ');
  return {
    checkIn: dates[0] || '2025-05-10',
    checkOut: dates[1] || '2025-05-13'
  };
}

// Calculate number of nights from date range
function calculateNights(dateRange) {
  if (!dateRange) return 3;
  
  const dates = extractDatesFromRange(dateRange);
  const checkIn = new Date(dates.checkIn);
  const checkOut = new Date(dates.checkOut);
  
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return 3;
  
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Format date to display format
function formatDisplayDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}

// Function to load previously saved search data
function loadSavedSearchData() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;
  
  const searchData = getBookingData('searchData');
  if (!searchData) return;
  
  // Set values if elements exist
  if (searchData.hotel) {
    const hotelSelect = searchBar.querySelector('select[aria-label="Hotel Selection"]');
    if (hotelSelect) hotelSelect.value = searchData.hotel;
  }
  
  if (searchData.dateRange) {
    const dateRangeInput = document.getElementById('date-range');
    if (dateRangeInput) dateRangeInput.value = searchData.dateRange;
  }
  
  if (searchData.guests) {
    const guestsSelect = searchBar.querySelector('select[aria-label="Number of Guests"]');
    if (guestsSelect) guestsSelect.value = searchData.guests;
  }
  
  if (searchData.rooms) {
    const roomsSelect = searchBar.querySelector('select[aria-label="Number of Rooms"]');
    if (roomsSelect) roomsSelect.value = searchData.rooms;
  }
  
  if (searchData.specialCode) {
    const specialCodeInput = searchBar.querySelector('input[placeholder="Special Code"]');
    if (specialCodeInput) specialCodeInput.value = searchData.specialCode;
  }
  
  // console.log('Loaded saved search data');
}

// ===== DATE PICKER FUNCTIONALITY =====
function initDatePicker() {
  const dateRangePicker = document.getElementById('date-range');
  if (dateRangePicker) {
    flatpickr("#date-range", {
      mode: "range",
      dateFormat: "Y-m-d",
      defaultDate: ["2025-05-10", "2025-05-13"],
      onChange: function(selectedDates, dateStr) {
        // Save the selected date range when it changes
        saveSearchData();
      }
    });
    // console.log('Date picker initialized');
  }
}

// ===== ROOM SELECTION FUNCTIONALITY =====
function initRoomSelection() {
  // Check if we're on the room selection page
  const selectButtons = document.querySelectorAll('.select');
  if (selectButtons.length === 0) {
    return;
  }
  
  // console.log('Room selection page initialized');
  
  // Add click handlers to all select buttons
  selectButtons.forEach((button, index) => {
    button.addEventListener('click', (event) => {
      // Get room info from data attributes
      const roomName = button.getAttribute('data-room') || 'Premium Room Sea View King Bed';
      const pricePerNight = parseInt(button.getAttribute('data-price')) || 20000;
      
      // Get search data for calculating total
      const searchData = getBookingData('searchData');
      const nights = searchData?.nights || 3;
      
      // Calculate totals based on number of nights
      const price = pricePerNight * nights;
      const tax = Math.round(price * 0.18);
      const total = price + tax;
      
      // console.log(`Room selected: ${roomName}, Price per night: ${pricePerNight}, Nights: ${nights}`);
      
      // Create room selection data with complete information
      const roomData = {
        roomName,
        pricePerNight,
        price,
        tax,
        total,
        nights,
        // Include formatted dates for display
        checkIn: searchData?.dates?.checkIn || '2025-05-10',
        checkOut: searchData?.dates?.checkOut || '2025-05-13',
        displayCheckIn: formatDisplayDate(searchData?.dates?.checkIn),
        displayCheckOut: formatDisplayDate(searchData?.dates?.checkOut),
        guests: searchData?.guests || '2 Guests',
        rooms: searchData?.rooms || '1 Room'
      };
      
      // Save to localStorage
      saveBookingData('roomSelection', roomData);
      
      // Update the UI before navigation
      updateRoomSelection(roomData);
      
      // Navigate to personal details page (with a slight delay to see updates)
      setTimeout(() => {
        window.location.href = '/personal';
      }, 1000);
    });
  });
}

// Populate room selection data on page load
function populateRoomSelectionData() {
  // Load saved search data to display in "Your Stay"
  const allData = getAllBookingData();
  
  // Update Your Stay sidebar with existing data
  if (allData.search) {
    updateYourStayDisplay(allData.search);
  }
  
  // If we already have a room selected, update that
  if (allData.room && allData.room.roomName) {
    updateRoomSelection(allData.room);
  }
}

// Update the "Your Stay" sidebar with search information
function updateYourStayDisplay(searchData) {
  const yourStayElement = document.querySelector('.your-stay');
  if (!yourStayElement) return;
  
  // Extract and format data for display
  const roomsText = searchData.rooms || '1 Room';
  const guestsText = searchData.guests || '2 Guests';
  
  // Extract numbers from text
  const roomsCount = parseInt(roomsText) || 1;
  const guestsCount = parseInt(guestsText) || 2;
  
  // Generate correct text (singular or plural)
  const roomsStr = roomsCount === 1 ? 'Room 1' : `${roomsCount} Rooms`;
  const guestsStr = guestsCount === 1 ? '1 Adult' : `${guestsCount} Adults`;
  
  // Find or create info paragraph
  let guestsInfo = yourStayElement.querySelector('p:first-of-type');
  if (!guestsInfo) {
    guestsInfo = document.createElement('p');
    yourStayElement.appendChild(guestsInfo);
  }
  
  // Update the content
  guestsInfo.innerHTML = `${roomsStr}: ${guestsStr}<br><span class="selection">Not selected</span>`;
}

// Function to update the UI with room selection
function updateRoomSelection(roomData) {
  const asideElement = document.querySelector('.your-stay');
  if (!asideElement) {
    // console.error('Could not find .your-stay element');
    return;
  }
  
  // Get current guest information (if any)
  const currentGuestInfo = asideElement.querySelector('p:first-of-type')?.innerHTML.split('<br>')[0] || 
                         `${roomData.rooms || '1 Room'}: ${roomData.guests || '2 Adults'}`;
  
  // Keep the original heading
  const heading = asideElement.querySelector('h4')?.outerHTML || 
                 '<h4><div class="stay">Your Stay</div></h4>';
  
  // Format dates for display
  const checkInDate = roomData.displayCheckIn || formatDisplayDate(roomData.checkIn) || '10 May 2025';
  const checkOutDate = roomData.displayCheckOut || formatDisplayDate(roomData.checkOut) || '13 May 2025';
  
  // Replace the entire content
  asideElement.innerHTML = `
    ${heading}
    <p>${currentGuestInfo}<br><span class="selection">${roomData.roomName}</span></p>
    <p><strong>Dates:</strong> ${checkInDate} - ${checkOutDate}</p>
    <p><strong>Price:</strong> ₹ ${roomData.pricePerNight.toLocaleString()} per night (${roomData.nights} nights)</p>
    <p><strong>Room Total:</strong> ₹ ${roomData.price.toLocaleString()}</p>
    <p><strong>Taxes and Fees:</strong> ₹ ${roomData.tax.toLocaleString()}</p>
    <p class="total"><strong>Total Amount:</strong> ₹ ${roomData.total.toLocaleString()}</p>
  `;
  
  // console.log('Room selection updated successfully');
}

// ===== PERSONAL DETAILS FORM FUNCTIONALITY =====
function initPersonalDetailsForm() {
  const personalForm = document.getElementById('personal-details-form');
  if (!personalForm) {
    return; // Not on personal details page
  }
  
  // console.log('Personal details page detected');
  
  // Handle form submission
  // personalForm.addEventListener('submit', function(e) {
  //   e.preventDefault();
    
  //   // Save form data
  //   const formData = {
  //     firstName: document.getElementById('firstName')?.value || '',
  //     lastName: document.getElementById('lastName')?.value || '',
  //     email: document.getElementById('email')?.value || '',
  //     phone: document.getElementById('phone')?.value || '',
  //     address: document.getElementById('address')?.value || '',
  //     city: document.getElementById('city')?.value || '',
  //     state: document.getElementById('state')?.value || '',
  //     postalCode: document.getElementById('postalCode')?.value || '',
  //     country: document.getElementById('country')?.value || ''
  //   };
    
  //   // Save personal details to localStorage
  //   saveBookingData('personalDetails', formData);
    
  //   // Navigate to payment page
  //   window.location.href = '/payment';
  // });
  personalForm.addEventListener('submit', async function(e) {
    e.preventDefault();
  
    // Save form data
    const formData = {
      firstName: document.getElementById('firstName')?.value || '',
      lastName: document.getElementById('lastName')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || '',
      postalCode: document.getElementById('postalCode')?.value || '',
      country: document.getElementById('country')?.value || ''
    };
  
    // Save personal details to localStorage
    saveBookingData('personalDetails', formData);
  
    // Send guest info to the backend to insert into DB
    try {
      const res = await fetch('/submit-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fname: formData.firstName,
          lname: formData.lastName,
          email: formData.email,
          phone_no: formData.phone
        })
      });
  
      const result = await res.json();
  
      if (res.ok) {
        console.log('Guest data saved successfully:', result);
        // Redirect to payment page
        window.location.href = '/payment';
      } else {
        alert('Failed to save guest information. Please try again.');
      }
    } catch (err) {
      console.error('Error saving guest data:', err);
      alert('A server error occurred while saving guest details.');
    }
  });
  
  
  // Handle "Back" button
  const backBtn = document.querySelector('.btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/rooms';
    });
  }
}

// Populate personal details form from saved data
function populatePersonalDetailsData() {
  // Display booking summary first
  displayBookingSummary();
  
  // Pre-fill form with saved data if available
  const personalDetails = getBookingData('personalDetails');
  if (!personalDetails) return;
  
  // Populate form fields
  for (const [key, value] of Object.entries(personalDetails)) {
    const input = document.getElementById(key);
    if (input) input.value = value;
  }
  
  console.log('Personal details form populated');
}

// ===== PAYMENT FORM FUNCTIONALITY =====
function initPaymentForm() {
  const paymentForm = document.getElementById('payment-form');
  const randomDataBtn = document.getElementById('random-data-btn');
  const payButton = document.querySelector('.btn-pay');
  
  if (!paymentForm) {
    return; // Not on payment page
  }
  
  console.log('Payment page detected');
  
  // Update the payment button with dynamic amount
  if (payButton) {
    const roomData = getBookingData('roomSelection');
    if (roomData && roomData.total) {
      payButton.textContent = `Pay Now - ₹ ${roomData.total.toLocaleString()}`;
    }
  }
  
  // Fill random data button event
  if (randomDataBtn) {
    randomDataBtn.addEventListener('click', function() {
      document.getElementById('cardNumber').value = getRandomCardNumber();
      document.getElementById('expiryDate').value = getRandomExpiryDate();
      document.getElementById('cvv').value = getRandomCVV();
      document.getElementById('cardholderName').value = getRandomName();
    });
  }
  
  // Form submission event
  paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the last 4 digits of card number
    const cardNumber = document.getElementById('cardNumber').value;
    const lastFour = cardNumber.replace(/\s/g, '').slice(-4);
    
    // Get room data for total price
    const roomData = getBookingData('roomSelection');
    
    // Generate confirmation data
    const confirmationData = {
      paymentMethod: `Credit Card (xxxx-${lastFour})`,
      paymentDate: formatCurrentDate(),
      confirmationNumber: generateConfirmationNumber(),
      paymentAmount: roomData && roomData.total ? roomData.total : 70800
    };
    
    // Save confirmation data
    saveBookingData('bookingConfirmation', confirmationData);
    
    // Update payment method display
    updateConfirmationDisplay(confirmationData);
    
    // Hide payment form and show success
    const formContainer = document.getElementById('payment-form-container');
    const successContainer = document.getElementById('success-container');
    
    if (formContainer) formContainer.style.display = 'none';
    if (successContainer) successContainer.style.display = 'block';
    
    // Update stepper
    updateStepper();
    
    // Log confirmation for debugging
    console.log('Booking confirmed:', confirmationData);
  });
  
  // Navigation for payment tabs
  const tabs = document.querySelectorAll('.payment-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Handle "Back" button
  const backBtn = document.querySelector('.btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/personal';
    });
  }
}

// Populate payment form and booking summary
function populatePaymentData() {
  // Display booking summary on payment page
  displayBookingSummary();
  
  // Pre-populate any payment fields that might be saved
  const allData = getAllBookingData();
  
  // If we have confirmation data, update the success display
  if (allData.confirmation) {
    updateConfirmationDisplay(allData.confirmation);
  }
}

// Update stepper to show completed state
function updateStepper() {
  const activeStep = document.querySelector('.step.active');
  if (activeStep) {
    activeStep.classList.remove('active');
    activeStep.classList.add('completed');
    
    const stepNumber = activeStep.querySelector('.step-number');
    if (stepNumber) stepNumber.textContent = '✓';
  }
}

// // Update confirmation display
// function updateConfirmationDisplay(confirmationData) {
//   const paymentMethodEl = document.getElementById('payment-method');
//   if (paymentMethodEl) {
//     paymentMethodEl.textContent = confirmationData.paymentMethod;
//   }
  
//   const paymentDateEl = document.getElementById('payment-date');
//   if (paymentDateEl) {
//     paymentDateEl.textContent = confirmationData.paymentDate;
//   }
  
//   // Update booking reference number
//   const bookingRefEl = document.getElementById('booking-reference');
//   if (bookingRefEl) {
//     bookingRefEl.textContent = confirmationData.confirmationNumber;
//   }
  
//   // Update payment amount in success message
//   const paymentAmountEl = document.getElementById('payment-amount');
//   if (paymentAmountEl) {
//     // Get room data for the amount
//     const roomData = getBookingData('roomSelection');
//     if (roomData && roomData.total) {
//       paymentAmountEl.textContent = `₹ ${roomData.total.toLocaleString()}`;
//     } else if (confirmationData.paymentAmount) {
//       paymentAmountEl.textContent = `₹ ${confirmationData.paymentAmount.toLocaleString()}`;
//     }
//   }
// }

function updateConfirmationDisplay(confirmationData) {
  const paymentMethodEl = document.getElementById('payment-method');
  const paymentDateEl = document.getElementById('payment-date');
  const bookingRefEl = document.getElementById('booking-reference');
  const paymentAmountEl = document.getElementById('payment-amount');

  if (paymentMethodEl) {
    paymentMethodEl.textContent = confirmationData.paymentMethod;
  }

  if (paymentDateEl) {
    paymentDateEl.textContent = confirmationData.paymentDate;
  }

  if (bookingRefEl) {
    bookingRefEl.textContent = confirmationData.confirmationNumber;
  }

  let finalAmount = 0;
  const roomData = getBookingData('roomSelection');
  if (paymentAmountEl) {
    if (roomData && roomData.total) {
      finalAmount = roomData.total;
      paymentAmountEl.textContent = `₹ ${finalAmount.toLocaleString()}`;
    } else if (confirmationData.paymentAmount) {
      finalAmount = confirmationData.paymentAmount;
      paymentAmountEl.textContent = `₹ ${finalAmount.toLocaleString()}`;
    }
  }

  // Send booking data to backend
  const guestData = getBookingData('personalDetails'); // Assuming you saved it
  if (guestData && roomData) {
    fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bookingReference: confirmationData.confirmationNumber,
        guestEmail: guestData.email,
        roomNumber: roomData.roomNumber, // Ensure this exists in roomSelection
        paymentAmount: finalAmount,
        paymentDate: confirmationData.paymentDate,
        paymentMethod: confirmationData.paymentMethod
      })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save booking.');
      return res.json();
    })
    .then(data => {
      console.log('Booking saved:', data);
    })
    .catch(err => {
      console.error('Error saving booking:', err);
      alert('Failed to save booking. Please try again.');
    });
  }
}






// Display booking summary on personal details and payment pages
function displayBookingSummary() {
  const summaryContainer = document.querySelector('.booking-summary');
  if (!summaryContainer) return;
  
  // Get all booking data
  const allData = getAllBookingData();
  const roomData = allData.room;
  const searchData = allData.search;
  
  if (!roomData || !roomData.roomName) {
    console.warn('No room selection data found');
    return;
  }
  
  // Format dates for display
  const checkInDate = roomData.displayCheckIn || formatDisplayDate(roomData.checkIn) || '10 May 2025';
  const checkOutDate = roomData.displayCheckOut || formatDisplayDate(roomData.checkOut) || '13 May 2025';
  
  // Build HTML for booking summary
  let summaryHTML = `
    <h3>Booking Summary</h3>
    <div class="booking-details">
      <div class="booking-detail">
        <strong>Hotel:</strong> ${searchData.hotel || 'Taj Cidade de Goa Heritage'}
      </div>
      <div class="booking-detail">
        <strong>Room Type:</strong> ${roomData.roomName}
      </div>
      <div class="booking-detail">
        <strong>Check-in:</strong> ${checkInDate}
      </div>
      <div class="booking-detail">
        <strong>Check-out:</strong> ${checkOutDate}
      </div>
      <div class="booking-detail">
        <strong>Guests:</strong> ${roomData.guests || searchData.guests || '2 Adults'}
      </div>
      <div class="booking-detail">
        <strong>Room Rate:</strong> ₹ ${roomData.pricePerNight?.toLocaleString() || '20,000'} per night
      </div>
    </div>
    <div class="total-price">
      <div>Room Charges (${roomData.nights || 3} nights): ₹ ${roomData.price?.toLocaleString() || '60,000'}</div>
      <div>Taxes & Fees: ₹ ${roomData.tax?.toLocaleString() || '10,800'}</div>
      <div>Total Amount: ₹ ${roomData.total?.toLocaleString() || '70,800'}</div>
    </div>
  `;
  
  // Update the summary container
  summaryContainer.innerHTML = summaryHTML;
  console.log('Booking summary updated');
}

// ===== HELPER FUNCTIONS =====
function formatCurrentDate() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('default', { month: 'short' });
  const year = now.getFullYear();
  return `${day} ${month} ${year}`;
}

function generateConfirmationNumber() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars like 0/O, 1/I
  let result = 'TAJ-';
  // Add the current date in YYMMDD format
  const now = new Date();
  result += now.getFullYear().toString().substr(-2);
  result += (now.getMonth() + 1).toString().padStart(2, '0');
  result += now.getDate().toString().padStart(2, '0');
  
  // Add 4 random characters
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getRandomCardNumber() {
  const prefixes = ['4', '5', '37', '6'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let cardNumber = prefix;
  for (let i = 0; i < 15 - prefix.length; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  // Format with spaces
  return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
}

function getRandomExpiryDate() {
  const currentYear = new Date().getFullYear() % 100;
  const month = Math.floor(Math.random() * 12) + 1;
  const year = currentYear + Math.floor(Math.random() * 5) + 1;
  return `${month.toString().padStart(2, '0')}/${year}`;
}

function getRandomCVV() {
  return Math.floor(Math.random() * 900) + 100;
}

function getRandomName() {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'Robert', 'Lisa', 'Raj', 'Priya'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Sharma', 'Patel'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Credit card detection helper
function detectCardType(cardNumber) {
  if (!cardNumber) return null;
  
  // Basic regex patterns for card types
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6/
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber)) {
      return type;
    }
  }
  
  return null;
}

// Format card validation
function formatCardNumber(input) {
  let value = input.value.replace(/\D/g, '');
  
  if (value.length > 16) {
    value = value.slice(0, 16);
  }
  
  // Add spaces every 4 digits
  const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
  input.value = formattedValue;
  
  // Highlight card icon based on number
  const cardType = detectCardType(value);
  highlightCardIcon(cardType);
}

// Highlight card icon based on detected type
function highlightCardIcon(cardType) {
  const cardIcons = document.querySelectorAll('.card-icon');
  if (cardIcons.length === 0) return;
  
  cardIcons.forEach(icon => {
    icon.classList.remove('active');
    
    // Match icon with card type
    if (cardType) {
      if ((cardType === 'visa' && icon.textContent.includes('VISA')) ||
          (cardType === 'mastercard' && icon.textContent.includes('MC')) ||
          (cardType === 'amex' && icon.textContent.includes('AMEX')) ||
          (cardType === 'discover' && icon.textContent.includes('DISC'))) {
        icon.classList.add('active');
      }
    }
  });
}

// Add event listeners for card input formatting
document.addEventListener('DOMContentLoaded', function() {
  const cardNumberInput = document.getElementById('cardNumber');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      formatCardNumber(this);
    });
  }
});

//jbjb
// Simple script to update payment method display
document.addEventListener('DOMContentLoaded', function() {
  // Get payment tabs and payment method display
  const paymentTabs = document.querySelectorAll('.payment-tab');
  const paymentMethodDisplay = document.getElementById('payment-method');
  const paymentForm = document.getElementById('payment-form');
});