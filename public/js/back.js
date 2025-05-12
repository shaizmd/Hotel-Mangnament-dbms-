// Main entry point - runs when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
    return true;
  } catch (error) {
    console.error(`Error saving ${key} data:`, error);
    return false;
  }
}

function getBookingData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} data:`, error);
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

// ===== DATE PICKER FUNCTIONALITY =====
let picker; // Declare globally

function initDatePicker() {
  const dateRangePicker = document.getElementById('date-range');
  if (!dateRangePicker) return;

  // Initialize the flatpickr instance
  picker = flatpickr("#date-range", {
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: "today",
    onChange: function (selectedDates, dateStr, instance) {
      if (selectedDates.length === 2) {
        const diffInTime = selectedDates[1] - selectedDates[0];
        const diffInDays = diffInTime / (1000 * 3600 * 24);

        if (diffInDays > 10) {
          alert("You can select a maximum stay of 10 days.");
          instance.clear();
          return;
        }

        console.log("Date selection changed:", dateStr);
        saveSearchData();

        if (isRoomSelectionPage()) {
          const searchData = getBookingData('searchData');
          updateYourStayDisplay(searchData);
        }
      }
    }
  });

  // Pre-fill with saved dates if any
  const searchData = getBookingData('searchData');
  if (searchData?.dates?.checkIn && searchData?.dates?.checkOut) {
    console.log("Setting saved dates:", searchData.dates);
    picker.setDate([searchData.dates.checkIn, searchData.dates.checkOut]);
  }
}


// ===== NAVBAR SEARCH FUNCTIONALITY =====
function initNavbarSearch() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;
  
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
      
      // If on homepage, navigate to rooms page
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        window.location.href = '/';
      }
    });
  }
}

// Function to save all search bar data to localStorage
function saveSearchData() {
  const searchBar = document.querySelector('.search-bar');
  if (!searchBar) return;
  
  const dateRangeValue = document.getElementById('date-range')?.value || '';
  const dates = extractDatesFromRange(dateRangeValue);
  const nights = calculateNights(dates.checkIn, dates.checkOut);
  
  console.log("Saving search data with dates:", dates, "nights:", nights);
  
  const searchData = {
    hotel: searchBar.querySelector('select[aria-label="Hotel Selection"]')?.value || 'Taj Cidade de Goa Heritage',
    dateRange: dateRangeValue,
    dates: dates,
    guests: searchBar.querySelector('select[aria-label="Number of Guests"]')?.value || '2 Guests',
    rooms: searchBar.querySelector('select[aria-label="Number of Rooms"]')?.value || '1 Room',
    specialCode: searchBar.querySelector('input[placeholder="Special Code"]')?.value || '',
    nights: nights
  };
  
  saveBookingData('searchData', searchData);
}

// Helper function to extract check-in and check-out dates from range
function extractDatesFromRange(dateRange) {
  if (!dateRange) {
    console.log("No date range provided");
    return { checkIn: null, checkOut: null };
  }
  
  const dates = dateRange.split(' to ');
  return {
    checkIn: dates[0] || null,
    checkOut: dates[1] || null
  };
}

// Calculate number of nights between two dates
function calculateNights(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    console.log("Missing dates for night calculation");
    return 0;
  }
  
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    console.log("Invalid date format for night calculation");
    return 0;
  }
  
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  console.log("Calculated nights:", diffDays);
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
  
  console.log("Loading saved search data:", searchData);
  
  // Set values if elements exist
  if (searchData.hotel) {
    const hotelSelect = searchBar.querySelector('select[aria-label="Hotel Selection"]');
    if (hotelSelect) hotelSelect.value = searchData.hotel;
  }
  
  // Date range is handled in initDatePicker
  
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
}

// ===== ROOM SELECTION FUNCTIONALITY =====
function initRoomSelection() {
  // Check if we're on the room selection page
  const selectButtons = document.querySelectorAll('.select');
  if (selectButtons.length === 0) {
    return;
  }
  
  // Add click handlers to all select buttons
  selectButtons.forEach((button, index) => {
    button.addEventListener('click', (event) => {
      // Get room info from data attributes
      const roomName = button.getAttribute('data-room') || 'Premium Room Sea View King Bed';
      const pricePerNight = parseInt(button.getAttribute('data-price')) || 20000;
      const roomNumber = button.getAttribute('data-room-number') || `R${100 + index}`; // Add room number
      
      // Get search data for calculating total
      const searchData = getBookingData('searchData');
      const nights = searchData?.nights || 0;
      
      // If no nights are selected, alert user
      if (nights === 0) {
        alert("Please select check-in and check-out dates before selecting a room.");
        return;
      }
      
      // Calculate totals based on number of nights
      const price = pricePerNight * nights;
      const tax = Math.round(price * 0.18);
      const total = price + tax;
      
      // Create room selection data with complete information
      const roomData = {
        roomName,
        roomNumber,
        pricePerNight,
        price,
        tax,
        total,
        nights,
        // Include dates from search data
        checkIn: searchData?.dates?.checkIn || null,
        checkOut: searchData?.dates?.checkOut || null,
        displayCheckIn: formatDisplayDate(searchData?.dates?.checkIn),
        displayCheckOut: formatDisplayDate(searchData?.dates?.checkOut),
        guests: searchData?.guests || '2 Guests',
        rooms: searchData?.rooms || '1 Room'
      };
      
      console.log("Saving room selection data:", roomData);
      
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
  
  console.log("Populating room selection with data:", allData);
  
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
  
  console.log("Updating Your Stay display with:", searchData);
  
  // Extract and format data for display
  const roomsText = searchData.rooms || '1 Room';
  const guestsText = searchData.guests || '2 Guests';
  
  // Extract numbers from text
  const roomsCount = parseInt(roomsText) || 1;
  const guestsCount = parseInt(guestsText) || 2;
  
  // Generate correct text (singular or plural)
  const roomsStr = roomsCount === 1 ? 'Room 1' : `${roomsCount} Rooms`;
  const guestsStr = guestsCount === 1 ? '1 Adult' : `${guestsCount} Adults`;
  
  // Build HTML content for Your Stay section
  let stayContent = `
    <h4><div class="stay">Your Stay</div></h4>
    <p>${roomsStr}: ${guestsStr}<br><span class="selection">Not selected</span></p>
  `;
  
  // Add date information if available
  if (searchData.dates && searchData.dates.checkIn && searchData.dates.checkOut) {
    const displayCheckIn = formatDisplayDate(searchData.dates.checkIn);
    const displayCheckOut = formatDisplayDate(searchData.dates.checkOut);
    const nights = searchData.nights || 0;
    
    stayContent += `
      <p><strong>Dates:</strong> ${displayCheckIn} - ${displayCheckOut}</p>
      <p><strong>Nights:</strong> ${nights}</p>
    `;
  } else {
    stayContent += `<p><strong>Dates:</strong> Please select check-in and check-out dates</p>`;
  }
  
  // Update the content
  yourStayElement.innerHTML = stayContent;
}

// Function to update the UI with room selection
function updateRoomSelection(roomData) {
  const asideElement = document.querySelector('.your-stay');
  if (!asideElement) {
    return;
  }
  
  console.log("Updating room selection display with:", roomData);
  
  // Keep the original heading
  const heading = '<h4><div class="stay">Your Stay</div></h4>';
  
  // Format dates for display
  let dateDisplay = '<p><strong>Dates:</strong> Please select dates</p>';
  
  if (roomData.checkIn && roomData.checkOut) {
    const checkInDate = roomData.displayCheckIn || formatDisplayDate(roomData.checkIn);
    const checkOutDate = roomData.displayCheckOut || formatDisplayDate(roomData.checkOut);
    dateDisplay = `<p><strong>Dates:</strong> ${checkInDate} - ${checkOutDate}</p>`;
  }
  
  // Format room information
  const roomsText = roomData.rooms || '1 Room';
  const guestsText = roomData.guests || '2 Guests';
  
  // Extract numbers from text
  const roomsCount = parseInt(roomsText) || 1;
  const guestsCount = parseInt(guestsText) || 2;
  
  // Generate correct text (singular or plural)
  const roomsStr = roomsCount === 1 ? 'Room 1' : `${roomsCount} Rooms`;
  const guestsStr = guestsCount === 1 ? '1 Adult' : `${guestsCount} Adults`;
  
  // Replace the entire content
  asideElement.innerHTML = `
    ${heading}
    <p>${roomsStr}: ${guestsStr}<br><span class="selection">${roomData.roomName}</span></p>
    ${dateDisplay}
    <p><strong>Price:</strong> ₹ ${roomData.pricePerNight.toLocaleString()} per night (${roomData.nights} nights)</p>
    <p><strong>Room Total:</strong> ₹ ${roomData.price.toLocaleString()}</p>
    <p><strong>Taxes and Fees:</strong> ₹ ${roomData.tax.toLocaleString()}</p>
    <p class="total"><strong>Total Amount:</strong> ₹ ${roomData.total.toLocaleString()}</p>
  `;
}

// ===== PERSONAL DETAILS FORM FUNCTIONALITY =====
// function initPersonalDetailsForm() {
//   const personalForm = document.getElementById('personal-details-form');
//   if (!personalForm) {
//     return; // Not on personal details page
//   }
  
//   // Handle form submission
//   personalForm.addEventListener('submit', async function(e) {
//     e.preventDefault();
  
//     // Save form data
//     const formData = {
//       firstName: document.getElementById('firstName')?.value || '',
//       lastName: document.getElementById('lastName')?.value || '',
//       email: document.getElementById('email')?.value || '',
//       phone: document.getElementById('phone')?.value || '',
//       address: document.getElementById('address')?.value || '',
//       city: document.getElementById('city')?.value || '',
//       state: document.getElementById('state')?.value || '',
//       postalCode: document.getElementById('postalCode')?.value || '',
//       country: document.getElementById('country')?.value || ''
//     };
  
//     // Save personal details to localStorage
//     saveBookingData('personalDetails', formData);
  
//     // Send guest info to the backend to insert into DB
//     try {
//       const res = await fetch('/submit-guest', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           fname: formData.firstName,
//           lname: formData.lastName,
//           email: formData.email,
//           phone_no: formData.phone
//         })
//       });
  
//       const result = await res.json();
  
//       if (res.ok) {
//         console.log('Guest data saved successfully:', result);
//         // Redirect to payment page
//         window.location.href = '/payment';
//       } else {
//         alert('Failed to save guest information. Please try again.');
//       }
//     } catch (err) {
//       console.error('Error saving guest data:', err);
//       // Fallback in case API call fails - still allow user to proceed
//       console.log('Proceeding to payment page despite API error');
//       window.location.href = '/payment';
//     }
//   });
  
//   // Handle "Back" button
//   const backBtn = document.querySelector('.btn-back');
//   if (backBtn) {
//     backBtn.addEventListener('click', () => {
//       window.location.href = '/';
//     });
//   }
// }
function initPersonalDetailsForm() {
  const personalForm = document.getElementById('personal-details-form');
  if (!personalForm) {
    return; // Not on personal details page
  }

  // Function to display error message
  function showError(fieldId, message) {
    // Look for existing error element or create one
    let errorElement = document.getElementById(`${fieldId}-error`);
    
    if (!errorElement) {
      // Create error element if it doesn't exist
      errorElement = document.createElement('div');
      errorElement.id = `${fieldId}-error`;
      errorElement.className = 'error-message';
      errorElement.style.color = 'red';
      errorElement.style.fontSize = '12px';
      errorElement.style.marginTop = '5px';
      
      // Insert error element after the input field
      const inputField = document.getElementById(fieldId);
      if (inputField && inputField.parentNode) {
        inputField.parentNode.insertBefore(errorElement, inputField.nextSibling);
      }
    }
    
    // Set error message
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Highlight the input field
    const inputField = document.getElementById(fieldId);
    if (inputField) {
      inputField.style.borderColor = 'red';
    }
  }
  
  // Function to clear all error messages
  function clearErrors() {
    // Clear all error messages
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
      element.style.display = 'none';
    });
    
    // Reset input field styling
    const inputFields = personalForm.querySelectorAll('input');
    inputFields.forEach(field => {
      field.style.borderColor = '';
    });
  }

  // Handle form submission
  personalForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous error messages
    clearErrors();
    
    // Get form data
    const formData = {
      firstName: document.getElementById('firstName')?.value.trim() || '',
      lastName: document.getElementById('lastName')?.value.trim() || '',
      email: document.getElementById('email')?.value.trim() || '',
      phone: document.getElementById('phone')?.value.trim() || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || '',
      postalCode: document.getElementById('postalCode')?.value || '',
      country: document.getElementById('country')?.value || ''
    };
    
    // Validate inputs
    let isValid = true;
    
    // Name validation - letters only
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(formData.firstName)) {
      showError('firstName', 'First name must contain only letters');
      isValid = false;
    }
    
    if (!nameRegex.test(formData.lastName)) {
      showError('lastName', 'Last name must contain only letters');
      isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    // Phone validation - for Indian phone numbers (10 digits starting with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      showError('phone', 'Please enter a valid 10-digit Indian mobile number');
      isValid = false;
    }
    
    // If validation fails, stop form submission
    if (!isValid) {
      return;
    }
    
    // Save personal details to localStorage
    saveBookingData('personalDetails', formData);
    
    // Send guest info to the backend to insert into DB
    try {
      const res = await fetch('/submit-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      // Fallback in case API call fails - still allow user to proceed
      console.log('Proceeding to payment page despite API error');
      window.location.href = '/payment';
    }
  });
  
  // Add input event listeners for real-time validation feedback
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  
  if (firstNameInput) {
    firstNameInput.addEventListener('blur', function() {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (this.value.trim() !== '' && !nameRegex.test(this.value.trim())) {
        showError('firstName', 'First name must contain only letters');
      } else {
        // Clear error if valid
        const errorElement = document.getElementById('firstName-error');
        if (errorElement) errorElement.style.display = 'none';
        this.style.borderColor = '';
      }
    });
  }
  
  if (lastNameInput) {
    lastNameInput.addEventListener('blur', function() {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (this.value.trim() !== '' && !nameRegex.test(this.value.trim())) {
        showError('lastName', 'Last name must contain only letters');
      } else {
        // Clear error if valid
        const errorElement = document.getElementById('lastName-error');
        if (errorElement) errorElement.style.display = 'none';
        this.style.borderColor = '';
      }
    });
  }
  
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (this.value.trim() !== '' && !emailRegex.test(this.value.trim())) {
        showError('email', 'Please enter a valid email address');
      } else {
        // Clear error if valid
        const errorElement = document.getElementById('email-error');
        if (errorElement) errorElement.style.display = 'none';
        this.style.borderColor = '';
      }
    });
  }
  
  if (phoneInput) {
    phoneInput.addEventListener('blur', function() {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (this.value.trim() !== '' && !phoneRegex.test(this.value.trim())) {
        showError('phone', 'Please enter a valid 10-digit Indian mobile number');
      } else {
        // Clear error if valid
        const errorElement = document.getElementById('phone-error');
        if (errorElement) errorElement.style.display = 'none';
        this.style.borderColor = '';
      }
    });
  }

  // Handle "Back" button
  const backBtn = document.querySelector('.btn-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/';
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
}

// ===== PAYMENT FORM FUNCTIONALITY =====
function initPaymentForm() {
  const paymentForm = document.getElementById('payment-form');
  const randomDataBtn = document.getElementById('random-data-btn');
  const payButton = document.querySelector('.btn-pay');
  
  if (!paymentForm) {
    return; // Not on payment page
  }
  
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
    
    // Hide payment form and show success
    const formContainer = document.getElementById('payment-form-container');
    const successContainer = document.getElementById('success-container');
    
    if (formContainer) formContainer.style.display = 'none';
    if (successContainer) successContainer.style.display = 'block';
    
    // Update confirmation display and send data to backend ONLY after payment is processed
    updateConfirmationDisplay(confirmationData);
    
    // Update stepper
    updateStepper();
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
  
  // If we have confirmation data, update the UI only (without sending to backend)
  if (allData.confirmation) {
    // Just update the UI with the existing confirmation data
    updateConfirmationUI(allData.confirmation);
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

// Update only the UI elements for confirmation display without sending data to backend
function updateConfirmationUI(confirmationData) {
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
  
  const roomData = getBookingData('roomSelection');
  if (paymentAmountEl) {
    if (roomData && roomData.total) {
      paymentAmountEl.textContent = `₹ ${roomData.total.toLocaleString()}`;
    } else if (confirmationData.paymentAmount) {
      paymentAmountEl.textContent = `₹ ${confirmationData.paymentAmount.toLocaleString()}`;
    }
  }
}

// Update confirmation display AND send data to backend
function updateConfirmationDisplay(confirmationData) {
  // First update the UI
  updateConfirmationUI(confirmationData);
  
  // Get final amount from room data
  let finalAmount = 0;
  const roomData = getBookingData('roomSelection');
  if (roomData && roomData.total) {
    finalAmount = roomData.total;
  } else if (confirmationData.paymentAmount) {
    finalAmount = confirmationData.paymentAmount;
  }
  
  // THEN send booking data to backend - only called from payment form submission
  fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      bookingReference: confirmationData.confirmationNumber,
      paymentAmount: finalAmount,
      paymentDate: confirmationData.paymentDate,
      paymentMethod: confirmationData.paymentMethod
    })
  })
  .then(res => {
    console.log('Response status:', res.status);
    
    // Get more information about error responses
    if (!res.ok) {
      // Extract the error message from the response
      return res.json().then(errorData => {
        console.error('Server error details:', errorData);
        throw new Error(`Failed to save booking. Server says: ${errorData.message || 'Unknown error'}`);
      }).catch(err => {
        // If we can't parse the error as JSON, just throw the original error
        if (err.name === 'SyntaxError') {
          throw new Error(`Failed to save booking. Status: ${res.status}`);
        }
        throw err;
      });
    }
    
    return res.json();
  })
  .then(data => {
    console.log('Booking saved successfully:', data);
  })
  .catch(err => {
    console.error('Error saving booking:', err);
    // Don't alert to the user, as this is a non-critical operation for the UI flow
  });
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

// Payment method tab functionality
// document.addEventListener('DOMContentLoaded', function() {
//   // Get payment tabs and payment method display
//   const paymentTabs = document.querySelectorAll('.payment-tab');
//   const paymentMethodDisplay = document.getElementById('payment-method');
//   const paymentForm = document.getElementById('payment-form');
  
//   // Payment method display details
  
  
//   // Payment method display details
//   const paymentDetails = {
//     'Credit Card': 'Credit Card (xxxx-3486)',
//     'Debit Card': 'Debit Card (xxxx-5241)',
//     'Net Banking': 'Net Banking (HDFC Bank)',
//     'UPI': 'UPI (username@upi)'
//   };
  
//   // Keep track of selected payment method
//   let selectedPaymentMethod = 'Credit Card'; // Default
  
//   // Update payment method when a tab is clicked
//   paymentTabs.forEach(tab => {
//     tab.addEventListener('click', function() {
//       // Update active tab styling
//       paymentTabs.forEach(t => t.classList.remove('active'));
//       this.classList.add('active');
      
//       // Store selected payment method
//       selectedPaymentMethod = this.textContent;
      
//       // For testing: Update immediately to verify it's working
//       // console.log('Selected payment method:', selectedPaymentMethod);
//       // console.log('Payment display will show:', paymentDetails[selectedPaymentMethod]);
//     });
//   });
  
//   // Handle form submission - this is where we update the displayed payment method
//   paymentForm.addEventListener('submit', function(e) {
//     e.preventDefault(); // Prevent actual form submission
    
//     // Update payment method display with selected method
//     if (paymentMethodDisplay) {
//       paymentMethodDisplay.textContent = paymentDetails[selectedPaymentMethod];
//       // console.log('Payment method updated to:', paymentMethodDisplay.textContent);
//     } else {
//       // console.error('Payment method display element not found!');
//     }
    
//     // Show success container (assuming this logic exists elsewhere or is being added)
//     const successContainer = document.getElementById('success-container');
//     const paymentFormContainer = document.getElementById('payment-form-container');
    
//     if (successContainer && paymentFormContainer) {
//       paymentFormContainer.style.display = 'none';
//       successContainer.style.display = 'block';
//     }
//   });

// });
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const paymentTabs = document.querySelectorAll('.payment-tab');
  const paymentMethodDisplay = document.getElementById('payment-method');
  const paymentForm = document.getElementById('payment-form');
  const successContainer = document.getElementById('success-container');
  const paymentFormContainer = document.getElementById('payment-form-container');

  // Payment method display details
  const paymentDetails = {
    'Credit Card': 'Credit Card (xxxx-3486)',
    'Debit Card': 'Debit Card (xxxx-5241)',
    'Net Banking': 'Net Banking (HDFC Bank)',
    'UPI': 'UPI (username@upi)'
  };

  // Default selected method
  let selectedPaymentMethod = 'Credit Card';

  // Handle payment tab clicks
  if (paymentTabs.length > 0) {
    paymentTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Toggle active tab styling
        paymentTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Update selected method
        selectedPaymentMethod = this.textContent;
      });
    });
  }

  // Handle form submission
  if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent page reload

      // Update payment method display
      if (paymentMethodDisplay) {
        paymentMethodDisplay.textContent = paymentDetails[selectedPaymentMethod] || selectedPaymentMethod;
      } else {
        console.warn('Payment method display element not found.');
      }

      // Show success message and hide form
      if (successContainer && paymentFormContainer) {
        paymentFormContainer.style.display = 'none';
        successContainer.style.display = 'block';
      } else {
        console.warn('Success or form container missing.');
      }
    });
  } else {
    console.error('payment-form element not found!');
  }
});
