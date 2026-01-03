const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();
require('dotenv').config();
const DB = require('./database.js');
const GoogleSheetsService = require('./googleSheetsService.js');
const { peerProxy } = require('./peerproxy.js');

const authCookieName = 'token';

// The service port may be set on the command line
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the applications static content
app.use(express.static('public'));

// Router for service endpoints
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// Middleware to log requests
apiRouter.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
  if (await findUser('email', req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await findUser('email', req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', async (req, res) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    delete user.token;
    DB.updateUser(user);
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Middleware to verify that the user is authorized to call an endpoint
const verifyAuth = async (req, res, next) => {
  const user = await findUser('token', req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// get current user
apiRouter.get('/user/me', async (req, res) => {
  console.log('Getting current user');
  const token = req.cookies['token'];
  const user = await findUser('token', token);
  if (user) {
    res.send({ email: user.email, apiKey: user.apiKey });
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// Get all bookings (admin only) or user's bookings
apiRouter.get('/bookings', verifyAuth, async (req, res) => {
  try {
    const user = await findUser('token', req.cookies[authCookieName]);
    const bookings = await DB.getBookings(user.email);
    res.send(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send({ msg: 'Error fetching bookings' });
  }
});

// Create new booking
apiRouter.post('/booking', async (req, res) => {
  try {
    const booking = req.body;
    
    // Basic validation
    if (!booking.customerInfo || !booking.selectedDate || !booking.selectedTime) {
      return res.status(400).send({ msg: 'Missing required booking information' });
    }
    
    // Check if date is available in Google Sheets
    const isAvailable = await GoogleSheetsService.isDateAvailable(booking.selectedDate);
    if (!isAvailable) {
      return res.status(400).send({ msg: 'Selected date is not available' });
    }
    
    // Add to database
    const result = await DB.addBooking(booking);
    
    // Book the time slot in Google Sheets Schedule
    const scheduleResult = await GoogleSheetsService.bookTimeSlot(
      booking.selectedDate,
      booking.selectedTime
    );
    
    // Add booking details to Bookings sheet
    const bookingDetailsResult = await GoogleSheetsService.addBookingDetails(booking);
    
    console.log('✅ Booking processing completed:', {
      databaseSaved: !!result.insertedId,
      scheduleUpdated: scheduleResult.success,
      bookingDetailsExported: bookingDetailsResult.success
    });
    
    res.status(201).send({ 
      msg: 'Booking created successfully', 
      bookingId: result.insertedId,
      scheduleStatus: scheduleResult.message,
      bookingDetailsStatus: bookingDetailsResult.message
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).send({ msg: 'Error creating booking' });
  }
});

// Get available time slots for a date
apiRouter.get('/availability/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const bookings = await DB.getBookingsByDate(date);
    const bookedTimes = bookings.map(b => b.selectedTime);
    
    // Get date-specific time slots from Google Sheets
    const allTimeSlots = await GoogleSheetsService.fetchTimeSlotsForDate(date);
    const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));
    
    res.send({ availableSlots, bookedTimes });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).send({ msg: 'Error checking availability' });
  }
});

// Get time slots from Google Sheets (all unique slots)
apiRouter.get('/time-slots', async (req, res) => {
  try {
    const timeSlots = await GoogleSheetsService.fetchTimeSlots();
    res.send(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    // Fallback to default time slots
    res.send(['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']);
  }
});

// Get time slots for a specific date from Google Sheets
apiRouter.get('/time-slots/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const timeSlots = await GoogleSheetsService.fetchTimeSlotsForDate(date);
    res.send(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots for date:', error);
    // Return 404 or 500 to indicate the date should be disabled
    res.status(500).send({ msg: 'Error fetching time slots for this date', error: error.message });
  }
});

// Get available dates from Google Sheets
apiRouter.get('/available-dates', async (req, res) => {
  try {
    const availableDates = await GoogleSheetsService.fetchAvailableDates();
    res.send(availableDates);
  } catch (error) {
    console.error('Error fetching available dates:', error);
    // Return empty array if Google Sheets unavailable (allows all dates)
    res.send([]);
  }
});

// Get all booked appointments (for calendar)
apiRouter.get('/appointments', async (req, res) => {
  try {
    // Fetch from Google Sheets first, then fallback to database
    let appointments = await GoogleSheetsService.fetchBookedAppointments();
    
    if (appointments.length === 0) {
      // Fallback to database if Google Sheets is empty or unavailable
      const dbAppointments = await DB.getBookedAppointments();
      appointments = dbAppointments.map(apt => ({
        date: apt.selectedDate,
        time: apt.selectedTime
      }));
    } else {
      // Format Google Sheets data
      appointments = appointments.map(apt => ({
        date: apt.selectedDate,
        time: apt.selectedTime
      }));
    }
    
    res.send(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send({ msg: 'Error fetching appointments' });
  }
});

// Force refresh from Google Sheets
apiRouter.post('/sheets/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual refresh requested...');
    const appointments = await GoogleSheetsService.fetchBookedAppointments();
    const availability = await GoogleSheetsService.fetchAvailableDates();
    
    res.send({
      msg: 'Successfully refreshed from Google Sheets',
      appointments: appointments.length,
      availableDates: availability.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing from Google Sheets:', error);
    res.status(500).send({ msg: 'Error refreshing from Google Sheets' });
  }
});

// Get current sync status
apiRouter.get('/sheets/status', (req, res) => {
  const hasConfig = !!(process.env.GOOGLE_SHEETS_API_KEY && process.env.GOOGLE_SPREADSHEET_ID);
  res.send({
    configured: hasConfig,
    polling: GoogleSheetsService.pollInterval !== null,
    lastCheck: GoogleSheetsService.lastCheckTime,
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID?.substring(0, 10) + '...'
  });
});

// Sync database to Google Sheets (rebuild sheet from database)
apiRouter.post('/sheets/sync-from-db', async (req, res) => {
  try {
    console.log('🔄 Database → Google Sheets sync requested...');
    
    // Get all appointments from database
    const dbAppointments = await DB.getBookedAppointments();
    
    // Sync to Google Sheets
    const result = await GoogleSheetsService.syncDatabaseToSheets(dbAppointments);
    
    if (result.success) {
      res.send({
        msg: result.message,
        appointmentsSynced: result.count,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).send({ msg: result.message });
    }
  } catch (error) {
    console.error('Error syncing database to Google Sheets:', error);
    res.status(500).send({ msg: 'Error syncing database to Google Sheets' });
  }
});

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});



async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
  };
  await DB.addUser(user);

  return user;
}

async function findUser(field, value) {
  if (!value) return null;

  if (field === 'token') {
    return DB.getUserByToken(value);
  }
  return DB.getUser(value);
}

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

const httpService = app.listen(port, async () => {
  console.log(`Listening on port ${port}`);
  
  // Test Google Sheets connection on startup
  console.log('\n🔍 Testing Google Sheets integration...');
  const connectionWorking = await GoogleSheetsService.testConnection();
  
  // Start polling for changes if connection is working
  if (connectionWorking) {
    GoogleSheetsService.startPolling(60000); // Check every minute
    console.log('🔄 Started auto-refresh from Google Sheets (every 60 seconds)');
  }
});

peerProxy(httpService);