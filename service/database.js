const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('scheduler');
const userCollection = db.collection('user');
const bookingCollection = db.collection('booking');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
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
