const SEARCH_QUERY =
  '("software engineer" OR developer OR "data engineer" OR "backend engineer" OR "platform engineer" OR ' +
  '"java engineer" OR SDET) AND ("supply chain" OR logistics OR retail OR ecommerce OR fulfillment OR ' +
  'transportation OR "warehouse management" OR "last mile" OR "inventory management" OR restaurant OR ' +
  'hospitality OR foodservice OR "point of sale" OR bar OR kitchen OR "hospitality tech" OR "restaurant tech") ' +
  'AND (Java OR "Spring Boot" OR Spark OR Airflow OR API OR Drools OR Streaming OR GCP OR "BigQuery" OR ' +
  'Selenium OR Kafka OR PubSub OR microservices OR Kubernetes OR CI/CD OR "data pipelines" OR "unit testing") ' +
  'AND ("united states" OR USA) AND (remote OR "work from home" OR "work from anywhere") AND (' +
  '("US-based" OR "based in the US" OR "located in the United States" OR "located in the US" OR "work from US" OR ' +
  '"remote US" OR "remote (US)" OR "must reside in US" OR "must be US-based" OR "US only" OR "United States only") ' +
  'OR (-afghanistan -albania -algeria -andorra -angola -antigua -argentina -armenia -australia -austria ' +
  '-azerbaijan -bahamas -bahrain -bangladesh -barbados -belarus -belgium -belize -benin -bhutan -bolivia ' +
  '-bosnia -botswana -brazil -brunei -bulgaria -burkina -burundi -cambodia -cameroon -canada -cape -central ' +
  '-chad -chile -china -colombia -comoros -congo -costa -croatia -cuba -cyprus -czech -denmark -djibouti ' +
  '-dominica -dominican -ecuador -egypt -el -equatorial -eritrea -estonia -eswatini -ethiopia -fiji -finland ' +
  '-france -gabon -gambia -georgia -germany -ghana -greece -grenada -guatemala -guinea -guyana -haiti ' +
  '-honduras -hungary -iceland -india -indonesia -iran -iraq -ireland -israel -italy -ivory -jamaica -japan ' +
  '-jordan -kazakhstan -kenya -kiribati -korea -kosovo -kuwait -kyrgyzstan -laos -latvia -lebanon -lesotho ' +
  '-liberia -libya -liechtenstein -lithuania -luxembourg -madagascar -malawi -malaysia -maldives -mali -malta ' +
  '-marshall -mauritania -mauritius -mexico -micronesia -moldova -monaco -mongolia -montenegro -morocco ' +
  '-mozambique -myanmar -namibia -nauru -nepal -netherlands -new -zealand -nicaragua -niger -nigeria -north ' +
  '-norway -oman -pakistan -palau -panama -papua -paraguay -peru -philippines -poland -portugal -qatar ' +
  '-romania -russia -rwanda -saint -samoa -san -sao -saudi -senegal -serbia -seychelles -sierra -singapore ' +
  '-slovakia -slovenia -solomon -somalia -south -spain -sri -sudan -suriname -sweden -switzerland -syria ' +
  '-taiwan -tajikistan -tanzania -thailand -timor -togo -tonga -trinidad -tunisia -turkey -turkmenistan ' +
  '-tuvalu -uganda -ukraine -united -arab -uruguay -uzbekistan -vanuatu -venezuela -vietnam))';

// this list of countries is a bit excessive. It will probably cause jobs to be excluded from my results, if the role is explicly based in the US then a foreign country may be mentioned and still pass. 

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
