const fetch = require('node-fetch');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Google Sheets configuration
const GOOGLE_SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
  apiKey: process.env.GOOGLE_SHEETS_API_KEY,
  serviceAccountPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || './google-credentials.json',
  appointmentsRange: 'Appointments!A:C',
  availabilityRange: 'Availability!A:Z', // Extended range to capture all columns
  timeSlotsRange: 'Availability!C:Z', // All columns after Available column
};

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.lastCheckTime = new Date();
    this.pollInterval = null;
    this.initializeAuth();
  }

  // Initialize Google Sheets authentication
  async initializeAuth() {
    try {
      if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 No spreadsheet ID configured');
        return;
      }

      // Try API key authentication first (simpler, read-only)
      if (GOOGLE_SHEETS_CONFIG.apiKey) {
        this.sheets = google.sheets({ 
          version: 'v4', 
          auth: GOOGLE_SHEETS_CONFIG.apiKey 
        });
        console.log('✅ Google Sheets initialized with API key (read-only mode)');
        return;
      }

      // Fall back to service account authentication (read/write)
      const credentialsPath = path.resolve(GOOGLE_SHEETS_CONFIG.serviceAccountPath);
      
      if (!fs.existsSync(credentialsPath)) {
        console.log('🔧 Service account file not found:', credentialsPath);
        console.log('💡 For read/write access, provide google-credentials.json');
        return;
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      console.log('✅ Google Sheets authentication initialized with service account');
    } catch (error) {
      console.error('❌ Error initializing Google Sheets auth:', error.message);
    }
  }

  // Start polling for sheet changes
  startPolling(intervalMs = 30000) { // Check every 30 seconds
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
      const appointments = await this.fetchBookedAppointments();
      const availability = await this.fetchAvailableDates();
      
      // Emit events or update cache here
      this.onSheetsUpdated(appointments, availability);
    } catch (error) {
      console.error('❌ Error checking for sheet changes:', error.message);
    }
  }

  // Called when sheets are updated
  onSheetsUpdated(appointments, availability) {
    console.log('🔄 Google Sheets data updated:', {
      appointments: appointments.length,
      availableDates: availability.length
    });
    // You can add more logic here to notify your frontend
  }

  // Fetch booked appointments from Google Sheets
  async fetchBookedAppointments() {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured');
        return [];
      }

      console.log('📊 Attempting to connect to Google Sheets...');
      console.log('📋 Spreadsheet ID:', GOOGLE_SHEETS_CONFIG.spreadsheetId.substring(0, 10) + '...');
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.appointmentsRange,
      });
      
      console.log('✅ Successfully connected to Google Sheets!');
      const appointments = this.parseAppointments(response.data.values || []);
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
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured for availability check');
        return [];
      }

      console.log('📅 Checking available dates from Google Sheets...');
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.availabilityRange,
      });
      
      console.log('✅ Successfully fetched availability data from Google Sheets');
      const availableDates = this.parseAvailability(response.data.values || []);
      console.log(`📆 Found ${availableDates.length} available dates in Google Sheets:`, availableDates);
      
      return availableDates;
    } catch (error) {
      console.error('❌ Error fetching availability from Google Sheets:', error.message);
      console.log('📂 Returning empty dates array (allows all dates)...');
      return [];
    }
  }

  // Fetch time slots from Google Sheets Availability sheet column C
  async fetchTimeSlots() {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured for time slots');
        return ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']; // Default fallback
      }

      console.log('🕒 Fetching time slots from Google Sheets Availability sheet...');
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.timeSlotsRange,
      });
      
      const timeSlots = this.parseTimeSlots(response.data.values || []);
      console.log(`🕒 Found ${timeSlots.length} time slots in Google Sheets:`, timeSlots);
      
      return timeSlots.length > 0 ? timeSlots : ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'];
    } catch (error) {
      console.error('❌ Error fetching time slots from Google Sheets:', error.message);
      console.log('📂 Using default time slots...');
      return ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']; // Default fallback
    }
  }

  // Fetch time slots for a specific date from Google Sheets
  async fetchTimeSlotsForDate(targetDate) {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured for time slots');
        throw new Error('Google Sheets not configured');
      }

      console.log(`🕒 Fetching time slots for ${targetDate} from Google Sheets...`);
      
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.availabilityRange,
      });
      
      const timeSlots = this.parseTimeSlotsForDate(response.data.values || [], targetDate);
      console.log(`🕒 Found ${timeSlots.length} time slots for ${targetDate}:`, timeSlots);
      
      if (timeSlots.length === 0) {
        console.log(`⚠️ No time slots found for ${targetDate}`);
        throw new Error(`No time slots available for ${targetDate}`);
      }
      
      return timeSlots;
    } catch (error) {
      console.error('❌ Error fetching time slots for date from Google Sheets:', error.message);
      throw error; // Re-throw to let caller handle the error
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

  // Format time to ensure consistent AM/PM format
  formatTimeToAMPM(timeStr) {
    try {
      // If already in AM/PM format, return as is
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        return timeStr.trim();
      }
      
      // Handle 24-hour format (e.g., "14:00", "9:30")
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const min = minutes || '00';
        
        if (hour === 0) {
          return `12:${min} AM`;
        } else if (hour < 12) {
          return `${hour}:${min} AM`;
        } else if (hour === 12) {
          return `12:${min} PM`;
        } else {
          return `${hour - 12}:${min} PM`;
        }
      }
      
      // Handle hour only format (e.g., "9", "14")
      const hour = parseInt(timeStr);
      if (!isNaN(hour)) {
        if (hour === 0) {
          return '12:00 AM';
        } else if (hour < 12) {
          return `${hour}:00 AM`;
        } else if (hour === 12) {
          return '12:00 PM';
        } else {
          return `${hour - 12}:00 PM`;
        }
      }
      
      // If we can't parse it, return as is
      return timeStr.trim();
    } catch (error) {
      console.error('Error formatting time:', timeStr, error);
      return timeStr;
    }
  }

  // Parse time slots from sheet data (any column after Available column)
  parseTimeSlots(rows) {
    const timeSlots = [];
    const uniqueSlots = new Set();
    
    // Process all rows starting from row 1 (skip header if exists)
    const startRow = rows.length > 0 && rows[0] && rows[0].some(cell => 
      cell && cell.toLowerCase().includes('time')) ? 1 : 0;
    
    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      
      // Check every column from C onwards (columns 2, 3, 4, ...)
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        
        if (cell && typeof cell === 'string' && cell.trim()) {
          const rawTimeSlot = cell.trim();
          
          // Check if it looks like a time slot (contains AM/PM, colon, or is numeric)
          if (this.looksLikeTime(rawTimeSlot)) {
            const formattedTimeSlot = this.formatTimeToAMPM(rawTimeSlot);
            if (!uniqueSlots.has(formattedTimeSlot)) {
              uniqueSlots.add(formattedTimeSlot);
              timeSlots.push(formattedTimeSlot);
            }
          }
        }
      }
    }
    
    return timeSlots;
  }

  // Helper function to identify if a string looks like a time
  looksLikeTime(str) {
    // Already has AM/PM
    if (str.includes('AM') || str.includes('PM')) {
      return true;
    }
    
    // Has colon (time separator)
    if (str.includes(':')) {
      return true;
    }
    
    // Is a number that could be an hour (0-23)
    const num = parseInt(str);
    if (!isNaN(num) && num >= 0 && num <= 23) {
      return true;
    }
    
    return false;
  }

  // Parse time slots for a specific date from sheet data
  parseTimeSlotsForDate(rows, targetDate) {
    const timeSlots = [];
    
    // Process all rows starting from row 1 (skip header if exists)
    const startRow = rows.length > 0 && rows[0] && rows[0].some(cell => 
      cell && cell.toLowerCase().includes('time')) ? 1 : 0;
    
    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      
      if (row.length >= 2) {
        const [date, available] = row;
        
        // Check if this row matches our target date and is available
        const formattedDate = this.formatDate(date);
        if (formattedDate === targetDate && available && available.toLowerCase() === 'yes') {
          // Extract time slots from columns 2 onwards (C, D, E, ...)
          for (let j = 2; j < row.length; j++) {
            const cell = row[j];
            
            if (cell && typeof cell === 'string' && cell.trim()) {
              const rawTimeSlot = cell.trim();
              
              // Check if it looks like a time slot
              if (this.looksLikeTime(rawTimeSlot)) {
                const formattedTimeSlot = this.formatTimeToAMPM(rawTimeSlot);
                timeSlots.push(formattedTimeSlot);
              }
            }
          }
        }
      }
    }
    
    return timeSlots;
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

  // Add new appointment to Google Sheets
  async addAppointmentToSheet(appointment) {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured, skipping sheet update');
        return;
      }

      console.log('📝 Adding new appointment to Google Sheets...', {
        date: appointment.selectedDate,
        time: appointment.selectedTime
      });
      
      const formattedDate = new Date(appointment.selectedDate).toLocaleDateString('en-US');
      const values = [[formattedDate, appointment.selectedTime, 'booked']];
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.appointmentsRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: values
        }
      });
      
      console.log('✅ Successfully added appointment to Google Sheets');
    } catch (error) {
      console.error('❌ Error adding appointment to Google Sheets:', error.message);
      console.log('📂 Booking will still be saved to database...');
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
    
    if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
      console.log('❌ No spreadsheet ID configured');
      return false;
    }
    
    if (!this.sheets) {
      console.log('❌ Google Sheets authentication not initialized');
      return false;
    }
    
    console.log('📋 Spreadsheet ID:', GOOGLE_SHEETS_CONFIG.spreadsheetId.substring(0, 15) + '...');
    console.log('🔑 Service Account: Authenticated');
    
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

  // Clear and rebuild Google Sheets from database
  async syncDatabaseToSheets(dbAppointments) {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured, skipping sync');
        return { success: false, message: 'Google Sheets not configured' };
      }

      console.log('🔄 Starting database → Google Sheets sync...');
      console.log(`📊 Found ${dbAppointments.length} appointments in database`);

      // Clear existing appointments sheet (keep headers)
      await this.clearAppointmentsSheet();
      
      // Add all database appointments to sheet
      if (dbAppointments.length > 0) {
        await this.batchAddAppointments(dbAppointments);
      }
      
      console.log('✅ Successfully synced database to Google Sheets!');
      return { 
        success: true, 
        message: `Synced ${dbAppointments.length} appointments to Google Sheets`,
        count: dbAppointments.length
      };
    } catch (error) {
      console.error('❌ Error syncing to Google Sheets:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Clear appointments sheet but keep headers
  async clearAppointmentsSheet() {
    await this.sheets.spreadsheets.values.clear({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      range: GOOGLE_SHEETS_CONFIG.appointmentsRange,
    });
    
    // Add headers back
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      range: 'Appointments!A1:C1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Date', 'Time', 'Status']]
      }
    });
    
    console.log('🗑️ Cleared appointments sheet');
  }

  // Batch add multiple appointments
  async batchAddAppointments(appointments) {
    const values = appointments.map(apt => [
      new Date(apt.selectedDate).toLocaleDateString('en-US'),
      apt.selectedTime,
      'booked'
    ]);
    
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
      range: GOOGLE_SHEETS_CONFIG.appointmentsRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: values
      }
    });
    
    console.log(`📝 Added ${appointments.length} appointments to sheet`);
  }

  // Update availability status for a specific date
  async updateAvailabilityStatus(targetDate, status) {
    try {
      if (!this.sheets || !GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.log('🔧 Google Sheets not configured, skipping availability update');
        return { success: false, message: 'Google Sheets not configured' };
      }

      console.log(`🔄 Updating availability for ${targetDate} to "${status}"...`);
      
      // First, get all availability data to find the correct row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: GOOGLE_SHEETS_CONFIG.availabilityRange,
      });
      
      const rows = response.data.values || [];
      
      // Find the row for this date
      let targetRowIndex = -1;
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        const row = rows[i];
        if (row.length >= 1) {
          const formattedDate = this.formatDate(row[0]);
          if (formattedDate === targetDate) {
            targetRowIndex = i + 1; // +1 because sheets are 1-indexed
            break;
          }
        }
      }
      
      if (targetRowIndex === -1) {
        console.log(`❌ Date ${targetDate} not found in availability sheet`);
        return { success: false, message: `Date ${targetDate} not found in availability sheet` };
      }
      
      // Update the Available column (column B) for this row
      const updateRange = `Availability!B${targetRowIndex}`;
      
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.spreadsheetId,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[status.toLowerCase()]]
        }
      });
      
      console.log(`✅ Successfully updated ${targetDate} availability to "${status}"`);
      return { 
        success: true, 
        message: `Updated ${targetDate} availability to "${status}"`,
        date: targetDate,
        status: status
      };
    } catch (error) {
      console.error('❌ Error updating availability status:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Check if a date is fully booked and update availability
  async checkAndUpdateFullyBookedDate(targetDate, allTimeSlots, bookedAppointments) {
    try {
      // Get booked slots for this specific date
      const bookedSlotsForDate = bookedAppointments.filter(apt => {
        const formattedAptDate = this.formatDate(apt.selectedDate || apt.date);
        return formattedAptDate === targetDate;
      });
      
      console.log(`📊 Date ${targetDate}: ${bookedSlotsForDate.length} booked out of ${allTimeSlots.length} total slots`);
      
      // If all time slots are booked, update availability to "no"
      if (bookedSlotsForDate.length >= allTimeSlots.length) {
        console.log(`🚫 Date ${targetDate} is fully booked! Updating availability sheet...`);
        const result = await this.updateAvailabilityStatus(targetDate, 'no');
        return result;
      } else {
        console.log(`✅ Date ${targetDate} still has available slots`);
        return { success: true, message: `Date ${targetDate} still has ${allTimeSlots.length - bookedSlotsForDate.length} available slots` };
      }
    } catch (error) {
      console.error('❌ Error checking/updating fully booked date:', error.message);
      return { success: false, message: error.message };
    }
  }

  // Auto-update availability when new appointment is added
  async addAppointmentAndUpdateAvailability(appointment, allTimeSlots, allBookedAppointments) {
    try {
      // First add the appointment
      await this.addAppointmentToSheet(appointment);
      
      // Then check if the date is now fully booked
      const targetDate = this.formatDate(appointment.selectedDate);
      const updatedBookedAppointments = [...allBookedAppointments, appointment];
      
      const result = await this.checkAndUpdateFullyBookedDate(targetDate, allTimeSlots, updatedBookedAppointments);
      
      return {
        appointmentAdded: true,
        availabilityUpdated: result.success,
        message: `Appointment added. ${result.message}`
      };
    } catch (error) {
      console.error('❌ Error adding appointment and updating availability:', error.message);
      return { success: false, message: error.message };
    }
  }
}

module.exports = new GoogleSheetsService();