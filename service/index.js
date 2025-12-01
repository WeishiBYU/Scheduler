const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();
const DB = require('./database.js');
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
    
    const result = await DB.addBooking(booking);
    res.status(201).send({ 
      msg: 'Booking created successfully', 
      bookingId: result.insertedId 
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
    
    const allTimeSlots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'];
    const availableSlots = allTimeSlots.filter(slot => !bookedTimes.includes(slot));
    
    res.send({ availableSlots, bookedTimes });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).send({ msg: 'Error checking availability' });
  }
});

// Get all booked appointments (for calendar)
apiRouter.get('/appointments', async (req, res) => {
  try {
    const appointments = await DB.getBookedAppointments();
    const formattedAppointments = appointments.map(apt => ({
      date: apt.selectedDate,
      time: apt.selectedTime
    }));
    res.send(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).send({ msg: 'Error fetching appointments' });
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

const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

peerProxy(httpService);