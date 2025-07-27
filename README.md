# 🔍 Programmable Job Search Alerts with Google Apps Script

This Google Apps Script runs a powerful custom Google search query to find relevant remote job postings in specific industries (like logistics, retail, or foodservice) and sends them to your Gmail inbox every 30 minutes. The results are also logged into a Google Sheet for tracking and deduplication.

---

## 📦 Features

- Uses the [Google Programmable Search Engine (CSE)](https://programmablesearchengine.google.com/about/)
- Filters job results using specific technologies, sectors, and titles
- Sends new job listings to your Gmail
- Logs results in a Google Sheet
- Prevents duplicate emails using sheet-based deduplication
- Runs automatically every 30 minutes

---

## 🧠 Who It's For

Ideal for backend developers, data engineers, and job seekers in technical roles (Java/Spring/GCP/etc.) looking for industry-specific, remote opportunities. But anybody can alter it by changing the Custom Google Search to include other domains and changing the search string in the JS file to a boolean search that works for their purposes. 

---

## 🔧 Setup Instructions

### 1. Make a Copy of the Google Sheet

1. Open [this Google Sheet template](#) (add your link if sharing a public template)
2. Click `File → Make a copy`
3. Rename it as you'd like

---

### 2. Create a Programmable Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click **"Add"** and configure it to search the entire web (`Sites to Search: www.google.com`)
3. Name your engine (e.g., "JobSearchCSE")
4. Save and go to **Control Panel**
5. Copy your **Search Engine ID**
6. On the left, click **"Credentials" → API Key**
7. Copy the **API Key**

---

### 3. Add the Script to Your Google Account

1. Open [Google Apps Script](https://script.google.com/)
2. Create a **New Project**
3. Replace the contents of `Code.gs` with the code from this repo
4. At the top of the script, replace:
   - `YOUR_API_KEY_HERE` with your actual Google API key
   - `YOUR_SEARCH_ENGINE_ID_HERE` with your CSE ID
   - `YOUR_EMAIL_HERE` with your Gmail address
5. Save the project

---

### 4. Connect Your Google Sheet

1. In the script, replace the spreadsheet URL with your actual sheet:
   ```javascript
   const sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/your-sheet-id/edit").getSheetByName("Sheet1");
