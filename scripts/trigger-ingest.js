/**
 * Helper script to trigger video ingestion on the site.
 * Usage: node scripts/trigger-ingest.js [BASE_URL] [ADMIN_SECRET_KEY]
 * Example: node scripts/trigger-ingest.js http://localhost:3000 tu_secreto_aqui_para_ingesta_y_cron
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const secretKey = process.argv[3] || process.env.ADMIN_SECRET_KEY || "tu_secreto_aqui_para_ingesta_y_cron";
const status = process.argv[4] === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
const csvUrl = "http://webmaster.drtuber.com/?show=export&action=generate&aid=6694&channel=!&one=on&protocol=http&hq=0&pr=0&cnt=100&tmb=0&tcnt=1&owner=&ord=0&rating=0&delimeter=%7C&el=0&efr=0&ep=0&fr=0&f=&field1=1&field2=2&field3=3&field4=4&field5=5&field7=7&field8=0&field10=10&field11=11&field12=12&field13=13";

console.log(`Triggering video ingestion on: ${baseUrl}`);
console.log(`Target Status: ${status}`);
console.log(`Using CSV URL: ${csvUrl}\n`);

async function run() {
  try {
    const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/admin/ingest`;
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secretKey}`
      },
      body: JSON.stringify({
        csvUrl,
        provider: "drtuber",
        status
      })
    });

    const status = response.status;
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    console.log(`Response Status: ${status}`);
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error triggering ingestion:", error);
  }
}

run();
