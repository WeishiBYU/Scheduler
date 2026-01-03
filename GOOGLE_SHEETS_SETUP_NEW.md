# Google Sheets Integration Setup Guide

## Overview
Your booking system syncs with a single Google Sheet where each row is a date and columns represent time slots.

## Setup Steps

### 1. Create Google Sheet Structure

Create a single sheet named **"Schedule"** with this structure:

| Date       | 9:00 AM | 11:00 AM | 1:00 PM | 3:00 PM |
|------------|---------|----------|---------|---------|
| 01/06/2026 | open    | open     | open    | open    |
| 01/07/2026 | booked  | open     | open    | booked  |
| 01/08/2026 | open    | open     | booked  | open    |

**Structure:**
- **Column A**: Date (MM/DD/YYYY format)
- **Columns B+**: Time slots (headers are the times, cells contain "open" or "booked")

**How it works:**
- Empty cells or "open" = available for booking
- "booked" = slot is taken
- Add more columns for more time slots
- Add more rows for more dates

### 2. Get Google Service Account Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the **Google Sheets API**
4. **Create Service Account:**
   - APIs & Services → Credentials
   - Create Credentials → **Service Account**
   - Name it "scheduler-sheets"
   - Click "Create and Continue"
   - Skip role assignment → "Done"
5. **Download JSON Key:**
   - Click on your service account
   - Keys tab → "Add Key" → "Create new key"
   - Choose JSON format → Download
6. **Copy the JSON file** to `service/google-credentials.json`

### 3. Share Sheet with Service Account

1. Open the downloaded JSON file
2. Copy the **"client_email"** value (looks like: name@project.iam.gserviceaccount.com)
3. In your Google Sheet, click **"Share"**
4. Add the service account email as **Editor**

### 4. Configure Environment Variables

Edit `service/.env`:
```env
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_PATH=./google-credentials.json
```

**Get Spreadsheet ID** from your Google Sheets URL:
`https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

## How It Works

### Automatic Booking
- When someone books a slot, the system automatically marks it as "booked" in the sheet
- The sheet is refreshed every 60 seconds to show latest availability

### Managing Your Schedule

**To add available dates:**
1. Add a new row with the date in column A
2. Put "open" in each time slot column (or leave empty)

**To block a time slot:**
- Change the cell to "booked" or any value other than "open"

**To add more time slots:**
- Add a new column with the time as the header (e.g., "5:00 PM")
- Fill down with "open" or "booked" for each date

**To remove dates:**
- Delete the row or leave the date column empty

## Troubleshooting

### If Google Sheets integration fails:
- The system will fall back to the local database
- Check your service account credentials
- Ensure the sheet is named exactly "Schedule"
- Verify the spreadsheet is shared with the service account email

### Testing the integration:
1. Add a date with "open" slots in the Schedule sheet
2. Try booking that date through your website
3. Check if the slot changes to "booked" in the sheet
