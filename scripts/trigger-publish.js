/**
 * Helper script to trigger video publication (Drip-feed).
 * Usage: node scripts/trigger-publish.js [BASE_URL] [ADMIN_SECRET_KEY]
 * Example: node scripts/trigger-publish.js http://localhost:3000 tu_secreto_aqui_para_ingesta_y_cron
 */

const baseUrl = process.argv[2] || "http://localhost:3000";
const secretKey = process.argv[3] || process.env.ADMIN_SECRET_KEY || "tu_secreto_aqui_para_ingesta_y_cron";

console.log(`Triggering drip-feed publication on: ${baseUrl}\n`);

async function run() {
  try {
    const targetUrl = `${baseUrl.replace(/\/$/, "")}/api/cron/publish`;
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${secretKey}`
      }
    });

    const responseStatus = response.status;
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }

    console.log(`Response Status: ${responseStatus}`);
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error triggering publication:", error);
  }
}

run();
