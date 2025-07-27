const COUNTRY_BLACKLIST = 
  '-india -canada -uk -united -kingdom -australia -philippines -pakistan -brazil -germany -france ' +
  '-mexico -south -africa -ireland -singapore -netherlands -colombia -argentina -kenya -nigeria -malaysia ' +
  '-egypt -new -zealand -russia -italy -spain -sweden -norway -finland -denmark -belgium -portugal -switzerland ' +
  '-japan -china -south -korea -turkey -venezuela -peru -chile -costa -rica -czech -republic -hungary';
// there are still lots of countries that will get past this filter. You could use some merge logic to include them all, if you are getting a lot of results from Seychelles and places like that. Otherwise this should be good enough.

const US_LOCATION_WHITELIST = 
  '("US-based" OR "based in the US" OR "located in the United States" OR "located in the US" OR "work from US" OR ' +
  '"remote US" OR "remote (US)" OR "must reside in US" OR "must be US-based" OR "US only" OR "United States only")';

const BASE_SEARCH_QUERY =
  '("software engineer" OR developer OR "data engineer" OR "backend engineer" OR "platform engineer" OR ' +
  '"java engineer" OR SDET) AND ("supply chain" OR logistics OR retail OR ecommerce OR fulfillment OR ' +
  'transportation OR "warehouse management" OR "last mile" OR "inventory management" OR restaurant OR ' +
  'hospitality OR foodservice OR "point of sale" OR bar OR kitchen OR "hospitality tech" OR "restaurant tech") ' +
  'AND (Java OR "Spring Boot" OR Spark OR Airflow OR API OR Drools OR Streaming OR GCP OR "BigQuery" OR ' +
  'Selenium OR Kafka OR PubSub OR microservices OR Kubernetes OR CI/CD OR "data pipelines" OR "unit testing") ' +
  'AND ("united states" OR USA) AND (remote OR "work from home" OR "work from anywhere")';

const SEARCH_QUERY = `${BASE_SEARCH_QUERY} AND (${US_LOCATION_WHITELIST} OR (${COUNTRY_BLACKLIST}))`;

const EMAIL_TO = 'YOUR_EMAIL';
const API_KEY = 'YOUR_GCP_PROJECT_API_KEY';
const CX_ID = 'CX_ID_FROM_GOOGLE_PROGRAMMABLE_SEARCH';
const SCRIPT_PROP_KEY = 'sentLinks'; //this is a placeholder, you don't need to change it. 
const SHEET_ID = 'GOOGLE_SHEETS_ID_FOUND_IN_URL';

function searchAndEmailJobs() {
  const cache = PropertiesService.getScriptProperties();
  const seenLinks = JSON.parse(cache.getProperty(SCRIPT_PROP_KEY) || '[]');

  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX_ID}&q=${encodeURIComponent(SEARCH_QUERY)}&dateRestrict=d3`;

  const response = UrlFetchApp.fetch(url);
  const data = JSON.parse(response.getContentText());

  if (!data.items || data.items.length === 0) return;

  const newItems = data.items.filter(item => !seenLinks.includes(item.link));
  if (newItems.length === 0) return;

  const body = newItems.map(item =>
    `🔹 ${item.title}\n${item.link}\n${item.snippet}`
  ).join('\n\n');

  const subject = `🚀 ${newItems.length} New Remote US SWE Jobs – ${new Date().toLocaleTimeString()}`;

  MailApp.sendEmail(EMAIL_TO, subject, body);

  // Append to Google Sheet
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Jobs');
  newItems.forEach(item => {
    sheet.insertRows(2);  // Row 1 is the header, so insert at row 2

    sheet.getRange(2, 1, 1, 2).setValues([[
      new Date(),
      item.title,
      item.link,
      item.snippet
    ]]);
  });

  // Update seen links
  const updatedLinks = [...newItems.map(item => item.link), ...seenLinks].slice(0, 100);
  cache.setProperty(SCRIPT_PROP_KEY, JSON.stringify(updatedLinks));
}
