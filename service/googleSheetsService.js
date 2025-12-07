const fetch = require('node-fetch');

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
  apiKey: process.env.GOOGLE_SHEETS_API_KEY,
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  appointmentsRange: 'Appointments!A:C', // Date, Time, Status
  availabilityRange: 'Availability!A:B', // Date, Available (YES/NO)
};

class GoogleSheetsService {
  constructor() {
    this.baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values`;
  }

  // Fetch booked appointments from Google Sheets
  async fetchBookedAppointments() {
    try {
      if (!GOOGLE_SHEETS_CONFIG.apiKey || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured - missing API key or spreadsheet ID');
        return [];
      }

      console.log('📊 Attempting to connect to Google Sheets...');
      console.log('📋 Spreadsheet ID:', GOOGLE_SHEETS_CONFIG.spreadsheetId.substring(0, 10) + '...');
      
      const url = `${this.baseUrl}/${GOOGLE_SHEETS_CONFIG.appointmentsRange}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('❌ Google Sheets API error:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }
      
      console.log('✅ Successfully connected to Google Sheets!');
      const data = await response.json();
      const appointments = this.parseAppointments(data.values || []);
      console.log(`📅 Found ${appointments.length} booked appointments in Google Sheets`);
      
      return appointments;
    } catch (error) {
      console.error('❌ Error fetching appointments from Google Sheets:', error.message);
      console.log('📂 Falling back to database...');
      return [];
    }
  }

  // Fetch available dates from Google Sheets
  async fetchAvailableDates() {
    try {
      if (!GOOGLE_SHEETS_CONFIG.apiKey || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured for availability check');
        return [];
      }

      console.log('📅 Checking available dates from Google Sheets...');
      const url = `${this.baseUrl}/${GOOGLE_SHEETS_CONFIG.availabilityRange}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('❌ Google Sheets availability check failed:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }
      
      console.log('✅ Successfully fetched availability data from Google Sheets');
      const data = await response.json();
      const availableDates = this.parseAvailability(data.values || []);
      console.log(`📆 Found ${availableDates.length} available dates in Google Sheets`);
      
      return availableDates;
    } catch (error) {
      console.error('❌ Error fetching availability from Google Sheets:', error.message);
      console.log('📂 Defaulting to allow all dates...');
      return [];
    }
  }

  // Parse appointments from sheet data
  parseAppointments(rows) {
    const appointments = [];
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      if (row.length >= 3) {
        const [date, time, status] = row;
        
        if (status && status.toLowerCase() === 'booked') {
          const formattedDate = this.formatDate(date);
          if (formattedDate) {
            appointments.push({
              selectedDate: formattedDate,
              selectedTime: time.trim()
            });
          }
        }
      }
    }
    
    return appointments;
  }

  // Parse availability from sheet data
  parseAvailability(rows) {
    const availableDates = [];
    
    // Skip header row
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      if (row.length >= 2) {
        const [date, available] = row;
        
        if (available && available.toLowerCase() === 'yes') {
          const formattedDate = this.formatDate(date);
          if (formattedDate) {
            availableDates.push(formattedDate);
          }
        }
      }
    }
    
    return availableDates;
  }

  // Format date from Google Sheets to YYYY-MM-DD
  formatDate(dateStr) {
    try {
      let date;
      
      if (dateStr.includes('/')) {
        // Format: MM/DD/YYYY
        const [month, day, year] = dateStr.split('/');
        date = new Date(year, month - 1, day);
      } else if (dateStr.includes('-')) {
        // Format: YYYY-MM-DD
        date = new Date(dateStr);
      } else {
        date = new Date(dateStr);
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error parsing date:', dateStr, error);
      return null;
    }
  }

  // Add new appointment to Google Sheets
  async addAppointmentToSheet(appointment) {
    try {
      if (!GOOGLE_SHEETS_CONFIG.apiKey || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured, skipping sheet update');
        return;
      }

      console.log('📝 Adding new appointment to Google Sheets...', {
        date: appointment.selectedDate,
        time: appointment.selectedTime
      });
      
      const formattedDate = new Date(appointment.selectedDate).toLocaleDateString('en-US');
      const values = [[formattedDate, appointment.selectedTime, 'booked']];
      
      const url = `${this.baseUrl}/${GOOGLE_SHEETS_CONFIG.appointmentsRange}:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_CONFIG.apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: values })
      });
      
      if (!response.ok) {
        console.error('❌ Failed to add appointment to Google Sheets:', response.status, response.statusText);
        throw new Error(`Failed to add to Google Sheets: ${response.status}`);
      }
      
      console.log('✅ Successfully added appointment to Google Sheets');
    } catch (error) {
      console.error('❌ Error adding appointment to Google Sheets:', error.message);
      console.log('📂 Booking will still be saved to database...');
      // Don't throw error - we still want the booking to succeed in the database
    }
  }

  // Check if date is available based on Google Sheets
  async isDateAvailable(date) {
    try {
      console.log(`🔍 Checking if date ${date} is available...`);
      const availableDates = await this.fetchAvailableDates();
      const isAvailable = availableDates.includes(date);
      console.log(`📅 Date ${date} availability:`, isAvailable ? '✅ Available' : '❌ Not available');
      return isAvailable;
    } catch (error) {
      console.error('❌ Error checking date availability:', error.message);
      console.log('📂 Defaulting to available...');
      // Default to available if there's an error
      return true;
    }
  }

  // Test Google Sheets connection
  async testConnection() {
    console.log('\n🧪 Testing Google Sheets connection...');
    console.log('='.repeat(50));
    
    if (!GOOGLE_SHEETS_CONFIG.apiKey) {
      console.log('❌ No API key configured');
      return false;
    }
    
    if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
      console.log('❌ No spreadsheet ID configured');
      return false;
    }
    
    console.log('🔑 API Key:', GOOGLE_SHEETS_CONFIG.apiKey.substring(0, 20) + '...');
    console.log('📋 Spreadsheet ID:', GOOGLE_SHEETS_CONFIG.spreadsheetId.substring(0, 15) + '...');
    
    try {
      await this.fetchBookedAppointments();
      await this.fetchAvailableDates();
      console.log('✅ Google Sheets connection test PASSED!');
      console.log('='.repeat(50) + '\n');
      return true;
    } catch (error) {
      console.log('❌ Google Sheets connection test FAILED!');
      console.log('='.repeat(50) + '\n');
      return false;
    }
  }
}

module.exports = new GoogleSheetsService();