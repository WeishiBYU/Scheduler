<<<<<<< HEAD
# StockerV1
This is a quoting system for carpet cleaners. It will allow people to estimate the cost it would take for them to get their carpets cleans, get calenders scheduling, then upload to house call pro. 

[Notes](notes.md)

## Elevator Pitch

There is no good system for carpet cleaning companies. For most carpet companies they have to use a contact for their website then contact people about what kinda of quote they will be looking for. This is there for them to be more transparent so it is easier for people to get their quotes.

## Design

![Webapp Design](image.png)

## Key Features

- Quote Estimators 
- Scheduling Systems
- Information Summary
- Connects to House Call Pro API and Google Sheets to report information
                
## Technologies
I am going to use the required technologies in the following ways.

- **HTML** - Correct use of HTML for structure of 3 pages. (Quotes, Calender, Summary)
- **CSS** - Styling each page to look good on different aspect ratios and colors.
- **React** - Using JS to allow for quote estimation, making a summary, and service scheduling.
- **Web service** - Endpoints for:
    - Scheduling API
    - Google Sheets Api
    - HOUSE CALL PRO API Apis
- **Database**: Store quotes, api information.
- **WebSocket**: As an user gets quote, it is saved on the sheets website.

Update:
    Added websocket of a chat page on the bottom of the page!