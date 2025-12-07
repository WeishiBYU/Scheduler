# Google Sheets Integration Setup Guide

## Overview
Your booking system is now configured to sync with Google Sheets for managing available dates and appointments.

## Setup Steps

### 1. Create Google Sheets
Create two sheets in your Google Spreadsheet:

#### Sheet 1: "Appointments" 
Columns:
- **A**: Date (MM/DD/YYYY format)
- **B**: Time (e.g., "9:00 AM", "11:00 AM", etc.)
- **C**: Status ("booked" for occupied slots)

Example:
```
| Date       | Time     | Status |
|------------|----------|--------|
| 12/15/2025 | 9:00 AM  | booked |
| 12/15/2025 | 1:00 PM  | booked |
```

#### Sheet 2: "Availability"
Columns:
- **A**: Date (MM/DD/YYYY format)
- **B**: Available ("YES" for available dates, "NO" or blank for unavailable)

Example:
```
| Date       | Available |
|------------|-----------|
| 12/15/2025 | YES       |
| 12/16/2025 | YES       |
| 12/17/2025 | NO        |
```

### 2. Get Google Sheets API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Sheets API
4. Create credentials (API Key)
5. Restrict the API key to Google Sheets API only

### 3. Configure Environment Variables
1. Copy `service/.env.example` to `service/.env`
2. Fill in your credentials:
```
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
```

### 4. Get Spreadsheet ID
From your Google Sheets URL:
`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

Copy the `SPREADSHEET_ID` part.

### 5. Make Sheet Public (Read-Only)
1. Click "Share" in your Google Sheet
2. Set to "Anyone with the link can view"
3. This allows the API to read your sheet

## How It Works

### Date Availability
- The system checks the "Availability" sheet to determine which dates can be booked
- Only dates marked "YES" in column B will be available for booking
- Update this sheet to open/close booking dates

### Appointment Tracking
- When someone makes a booking, it's automatically added to the "Appointments" sheet
- The system reads existing appointments to prevent double-booking time slots
- Manual appointments can be added directly to this sheet

### Time Slots
The system uses these default time slots:
- 9:00 AM
- 11:00 AM  
- 1:00 PM
- 3:00 PM

## Managing Your Schedule

### To block a date:
Set "Available" to "NO" (or leave blank) in the Availability sheet

### To add manual appointments:
Add a row to the Appointments sheet with Date, Time, and "booked" status

### To see all bookings:
Check the Appointments sheet - it will show both online bookings and manual entries

## Troubleshooting

### If Google Sheets integration fails:
- The system will fall back to the local database
- Check your API key and spreadsheet ID
- Ensure the sheets are named exactly "Appointments" and "Availability"
- Verify the spreadsheet is shared publicly for viewing

### Testing the integration:
1. Add a date with "YES" in the Availability sheet
2. Try booking that date through your website
3. Check if the appointment appears in the Appointments sheet