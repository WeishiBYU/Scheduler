const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  apiKey: process.env.GOOGLE_SHEETS_API_KEY,
  serviceAccountPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './google-credentials.json',
  scheduleRange: 'Schedule!A:Z', // Single sheet with dates and time slots
  bookingsRange: 'Bookings!A:Z', // Booking details sheet
};

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.lastCheckTime = new Date();
    this.pollInterval = null;
    this.scheduleCache = null;
    this.initializeAuth();
  }

  // Initialize Google Sheets authentication
  async initializeAuth() {
    try {
      if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 No spreadsheet ID configured');
        return;
      }

      // Try service account authentication first (read/write)
      const credentialsPath = path.resolve(GOOGLE_SHEETS_CONFIG.serviceAccountPath);
      
      if (fs.existsSync(credentialsPath)) {
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        
        const auth = new google.auth.GoogleAuth({
          credentials: credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        console.log('✅ Google Sheets authentication initialized with service account (read/write)');
        return;
      }

      // Fall back to API key authentication (read-only)
      if (GOOGLE_SHEETS_CONFIG.apiKey) {
        this.sheets = google.sheets({ 
          version: 'v4', 
          auth: GOOGLE_SHEETS_CONFIG.apiKey 
        });
        console.log('✅ Google Sheets initialized with API key (read-only mode)');
        console.log('💡 For read/write access, provide google-credentials.json');
        return;
      }

      console.log('🔧 No Google Sheets authentication configured');
    } catch (error) {
      console.error('❌ Error initializing Google Sheets auth:', error.message);
    }
  }

  // Start polling for sheet changes
  startPolling(intervalMs = 60000) {
    console.log('📡 Starting Google Sheets polling for changes...');
    this.pollInterval = setInterval(async () => {
      await this.checkForChanges();
    }, intervalMs);
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      console.log('⏹️ Stopped Google Sheets polling');
    }
  }

  // Check for changes since last check
  async checkForChanges() {
    try {
      console.log('🔍 Checking for Google Sheets updates...');
      await this.fetchSchedule();
      
      const stats = this.getScheduleStats();
      console.log('🔄 Google Sheets data updated:', stats);
    } catch (error) {
      console.error('❌ Error checking for sheet changes:', error.message);
    }
  }

  // Fetch the entire schedule from Google Sheets
  async fetchSchedule() {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured');
        return null;
      }

      console.log('📊 Fetching schedule from Google Sheets...');
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.scheduleRange,
      });
      
      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        console.log('⚠️  No data found in Google Sheets');
        this.scheduleCache = null;
        return null;
      }

      // Parse the schedule: first row is headers (Date, time slots...)
      const headers = rows[0];
      const dateColumnIndex = 0;
      const timeSlotHeaders = headers.slice(1); // All columns after Date
      
      const schedule = {
        timeSlots: timeSlotHeaders,
        dates: []
      };

      // Parse each row (skip header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[dateColumnIndex]) continue; // Skip empty date rows
        
        const dateStr = row[dateColumnIndex];
        const formattedDate = this.formatDate(dateStr);
        
        if (!formattedDate) continue; // Skip invalid dates
        
        const dateEntry = {
          date: formattedDate,
          slots: {}
        };
        
        // Check each time slot column
        for (let j = 0; j < timeSlotHeaders.length; j++) {
          const timeSlot = timeSlotHeaders[j];
          const slotValue = (row[j + 1] || '').toString().trim().toLowerCase();
          
          dateEntry.slots[timeSlot] = {
            status: slotValue || 'empty',
            isAvailable: slotValue === 'open'
          };
        }
        
        schedule.dates.push(dateEntry);
      }
      
      this.scheduleCache = schedule;
      console.log(`✅ Schedule loaded: ${schedule.dates.length} dates, ${schedule.timeSlots.length} time slots`);
      
      return schedule;
    } catch (error) {
      console.error('❌ Error fetching schedule from Google Sheets:', error.message);
      return null;
    }
  }

  // Get schedule statistics
  getScheduleStats() {
    if (!this.scheduleCache) return { dates: 0, timeSlots: 0, available: 0, booked: 0 };
    
    let available = 0;
    let booked = 0;
    
    this.scheduleCache.dates.forEach(dateEntry => {
      Object.values(dateEntry.slots).forEach(slot => {
        if (slot.isAvailable) available++;
        else if (slot.status === 'booked') booked++;
      });
    });
    
    return {
      dates: this.scheduleCache.dates.length,
      timeSlots: this.scheduleCache.timeSlots.length,
      available,
      booked
    };
  }

  // Get all available dates
  async fetchAvailableDates() {
    try {
      if (!this.scheduleCache) {
        await this.fetchSchedule();
      }
      
      if (!this.scheduleCache) return [];
      
      // Return dates that have at least one available slot
      const availableDates = this.scheduleCache.dates
        .filter(dateEntry => {
          return Object.values(dateEntry.slots).some(slot => slot.isAvailable);
        })
        .map(dateEntry => dateEntry.date);
      
      console.log(`📅 Found ${availableDates.length} available dates`);
      return availableDates;
    } catch (error) {
      console.error('❌ Error fetching available dates:', error.message);
      return [];
    }
  }

  // Get all time slots (from header row)
  async fetchTimeSlots() {
    try {
      if (!this.scheduleCache) {
        await this.fetchSchedule();
      }
      
      if (!this.scheduleCache) return [];
      
      console.log(`⏰ Available time slots: ${this.scheduleCache.timeSlots.join(', ')}`);
      return this.scheduleCache.timeSlots;
    } catch (error) {
      console.error('❌ Error fetching time slots:', error.message);
      return [];
    }
  }

  // Get available time slots for a specific date
  async fetchTimeSlotsForDate(dateStr) {
    try {
      if (!this.scheduleCache) {
        await this.fetchSchedule();
      }
      
      if (!this.scheduleCache) return [];
      
      const dateEntry = this.scheduleCache.dates.find(d => d.date === dateStr);
      
      if (!dateEntry) {
        console.log(`📅 Date ${dateStr} not found in schedule`);
        return [];
      }
      
      // Return only available time slots for this date
      const availableSlots = Object.entries(dateEntry.slots)
        .filter(([time, slot]) => slot.isAvailable)
        .map(([time]) => time);
      
      console.log(`⏰ Available slots for ${dateStr}: ${availableSlots.join(', ')}`);
      return availableSlots;
    } catch (error) {
      console.error('❌ Error fetching time slots for date:', error.message);
      return [];
    }
  }

  // Get all booked appointments
  async fetchBookedAppointments() {
    try {
      if (!this.scheduleCache) {
        await this.fetchSchedule();
      }
      
      if (!this.scheduleCache) return [];
      
      const appointments = [];
      
      this.scheduleCache.dates.forEach(dateEntry => {
        Object.entries(dateEntry.slots).forEach(([time, slot]) => {
          if (!slot.isAvailable && slot.status === 'booked') {
            appointments.push({
              selectedDate: dateEntry.date,
              selectedTime: time
            });
          }
        });
      });
      
      console.log(`📅 Found ${appointments.length} booked appointments`);
      return appointments;
    } catch (error) {
      console.error('❌ Error fetching booked appointments:', error.message);
      return [];
    }
  }

  // Check if a date is available (has at least one open slot)
  async isDateAvailable(dateStr) {
    try {
      if (!this.scheduleCache) {
        await this.fetchSchedule();
      }
      
      if (!this.scheduleCache) return false;
      
      const dateEntry = this.scheduleCache.dates.find(d => d.date === dateStr);
      if (!dateEntry) return false;
      
      return Object.values(dateEntry.slots).some(slot => slot.isAvailable);
    } catch (error) {
      console.error('❌ Error checking date availability:', error.message);
      return false;
    }
  }

  // Book a time slot (mark as booked in Google Sheets)
  async bookTimeSlot(dateStr, timeSlot) {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured for writing');
        return { success: false, message: 'Google Sheets not configured' };
      }

      // Refresh schedule to get latest data
      await this.fetchSchedule();
      
      if (!this.scheduleCache) {
        return { success: false, message: 'Could not load schedule' };
      }

      // Find the row and column for this date/time
      const dateIndex = this.scheduleCache.dates.findIndex(d => d.date === dateStr);
      if (dateIndex === -1) {
        return { success: false, message: 'Date not found in schedule' };
      }

      const timeIndex = this.scheduleCache.timeSlots.indexOf(timeSlot);
      if (timeIndex === -1) {
        return { success: false, message: 'Time slot not found in schedule' };
      }

      // Calculate the cell position (A1 notation)
      // Row: dateIndex + 2 (skip header, 1-indexed)
      // Column: timeIndex + 2 (skip date column, B=2)
      const row = dateIndex + 2;
      const col = timeIndex + 2;
      const colLetter = this.columnToLetter(col);
      const cellRange = `Schedule!${colLetter}${row}`;

      console.log(`📝 Booking ${dateStr} at ${timeSlot} (cell: ${cellRange})`);

      // Update the cell to "booked"
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: cellRange,
        valueInputOption: 'RAW',
        resource: {
          values: [['booked']]
        }
      });

      console.log(`✅ Successfully booked ${dateStr} at ${timeSlot}`);
      
      // Refresh the cache
      await this.fetchSchedule();
      
      return { success: true, message: 'Booking successful' };
    } catch (error) {
      console.error('❌ Error booking time slot:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Helper: Convert column number to letter (1=A, 2=B, etc.)
  columnToLetter(column) {
    let temp;
    let letter = '';
    while (column > 0) {
      temp = (column - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      column = (column - temp - 1) / 26;
    }
    return letter;
  }

  // Format date from Google Sheets to YYYY-MM-DD
  formatDate(dateStr) {
    try {
      // Skip empty or invalid values
      if (!dateStr || dateStr.trim() === '' || dateStr === 'Date') {
        return null;
      }
      
      let date;
      
      if (dateStr.includes('/')) {
        // Format: MM/DD/YYYY
        const [month, day, year] = dateStr.split('/');
        date = new Date(year, parseInt(month) - 1, day);
      } else if (dateStr.includes('-')) {
        // Format: YYYY-MM-DD
        date = new Date(dateStr);
      } else {
        date = new Date(dateStr);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('⚠️  Invalid date value:', dateStr);
        return null;
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('❌ Error parsing date:', dateStr, error.message);
      return null;
    }
  }

  // Add booking details to Bookings sheet
  async addBookingDetails(bookingData) {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured for writing');
        return { success: false, message: 'Google Sheets not configured' };
      }

      console.log('📝 Adding booking details to Bookings sheet...');

      // Prepare the row data with all booking information
      const rowData = [
        new Date().toISOString(), // Timestamp
        bookingData.customerInfo?.firstName || '',
        bookingData.customerInfo?.lastName || '',
        bookingData.customerInfo?.email || '',
        bookingData.customerInfo?.phone || '',
        bookingData.customerInfo?.address || '',
        bookingData.selectedDate || '',
        bookingData.selectedTime || '',
        Array.isArray(bookingData.carpetServices) ? bookingData.carpetServices.join(', ') : '',
        Array.isArray(bookingData.upholsteryServices) ? bookingData.upholsteryServices.join(', ') : '',
        Array.isArray(bookingData.additionalServices) ? bookingData.additionalServices.join(', ') : '',
        bookingData.totalPrice || '',
        bookingData.paymentMethod || '',
        bookingData.presentForAppointment || '',
        bookingData.additionalInfo?.preVacuum || '',
        bookingData.additionalInfo?.odorIssues || '',
        bookingData.additionalInfo?.petUrineAreas || '',
        bookingData.additionalInfo?.stains || '',
        bookingData.additionalInfo?.specialInstructions || '',
        bookingData.additionalInfo?.generalInstructions || ''
      ];

      // Append the row to the Bookings sheet
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.bookingsRange,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [rowData]
        }
      });

      console.log('✅ Successfully added booking details to Bookings sheet');
      return { success: true, message: 'Booking details saved to sheet' };
    } catch (error) {
      console.error('❌ Error adding booking details:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Initialize Bookings sheet with headers (call this once to set up the sheet)
  async initializeBookingsSheet() {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured');
        return { success: false, message: 'Google Sheets not configured' };
      }

      const headers = [
        'Timestamp',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Address',
        'Date',
        'Time',
        'Carpet Services',
        'Upholstery Services',
        'Additional Services',
        'Total Price',
        'Payment Method',
        'Present for Appt',
        'Pre-Vacuum',
        'Odor Issues',
        'Pet Urine Areas',
        'Stains',
        'Special Instructions',
        'General Instructions'
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: 'Bookings!A1:T1',
        valueInputOption: 'RAW',
        resource: {
          values: [headers]
        }
      });

      console.log('✅ Bookings sheet initialized with headers');
      return { success: true, message: 'Headers created' };
    } catch (error) {
      console.error('❌ Error initializing Bookings sheet:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Test connection to Google Sheets
  async testConnection() {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('❌ Google Sheets not configured');
        return false;
      }

      console.log('\n🧪 Testing Google Sheets connection...');
      console.log('==================================================');
      console.log('📋 Spreadsheet ID:', GOOGLE_SHEETS_CONFIG.spreadsheetId.substring(0, 15) + '...');
      console.log('🔑 Authentication: Service Account');
      
      const schedule = await this.fetchSchedule();
      
      if (!schedule) {
        console.log('❌ Google Sheets connection test FAILED!');
        console.log('==================================================\n');
        return false;
      }
      
      const stats = this.getScheduleStats();
      console.log(`✅ Schedule loaded successfully!`);
      console.log(`📅 Dates: ${stats.dates}`);
      console.log(`⏰ Time slots: ${stats.timeSlots}`);
      console.log(`🟢 Available slots: ${stats.available}`);
      console.log(`🔴 Booked slots: ${stats.booked}`);
      console.log('✅ Google Sheets connection test PASSED!');
      console.log('==================================================\n');
      
      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error.message);
      console.log('==================================================\n');
      return false;
    }
  }
}

module.exports = new GoogleSheetsService();
