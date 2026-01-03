const { MongoClient } = require('mongodb');
require('dotenv').config();

// Use environment variables or fallback to local MongoDB
const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'scheduler';

const client = new MongoClient(mongoUrl);
const db = client.db(dbName);
const userCollection = db.collection('user');
const bookingCollection = db.collection('booking');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`✅ Connected to database: ${dbName}`);
  } catch (ex) {
    console.log(`⚠️  Unable to connect to database with ${mongoUrl} because ${ex.message}`);
    console.log('📝 The service will continue but database operations will fail.');
    console.log('💡 To fix: Set MONGODB_URL in your .env file or install MongoDB locally.');
  }
})();

function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function addBooking(booking) {
  const bookingWithTimestamp = {
    ...booking,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  return bookingCollection.insertOne(bookingWithTimestamp);
}

function getBookings(userEmail = null) {
  const query = userEmail ? { 'customerInfo.email': userEmail } : {};
  const options = {
    sort: { 'selectedDate': 1 },
  };
  const cursor = bookingCollection.find(query, options);
  return cursor.toArray();
}

function getBookingsByDate(date) {
  const query = { 'selectedDate': date };
  const cursor = bookingCollection.find(query);
  return cursor.toArray();
}

function getBookedAppointments() {
  const cursor = bookingCollection.find({}, {
    projection: { selectedDate: 1, selectedTime: 1 }
  });
  return cursor.toArray();
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addBooking,
  getBookings,
  getBookingsByDate,
  getBookedAppointments,
};
