import { HubConnectionBuilder } from "@microsoft/signalr";

const hubUrl = "https://api.hlbeer.me/hubs/catalog";

console.log(`Connecting to: ${hubUrl}`);
const connection = new HubConnectionBuilder()
  .withUrl(hubUrl)
  .withAutomaticReconnect()
  .build();

connection.on("catalog.changed", (notification) => {
  console.log("\n==================================================");
  console.log("SUCCESS: RECEIVED REAL-TIME SIGNALR NOTIFICATION!");
  console.log("Event: catalog.changed");
  console.log("Notification payload:", JSON.stringify(notification, null, 2));
  console.log("==================================================\n");
  
  connection.stop().then(() => {
    process.exit(0);
  });
});

try {
  await connection.start();
  console.log("SignalR connected successfully! Connection ID:", connection.connectionId);
  console.log("--------------------------------------------------");
  console.log("INSTRUCTIONS:");
  console.log("Please go to your Admin Panel in the browser,");
  console.log("edit any product (e.g., toggle draft/published or change price), and save it.");
  console.log("--------------------------------------------------");
  console.log("Waiting for events... (Timeout in 60 seconds)");
  
  setTimeout(() => {
    console.log("Timeout reached. No events received.");
    connection.stop().then(() => {
      process.exit(0);
    });
  }, 180000);
} catch (err) {
  console.error("Connection failed:", err);
  process.exit(1);
}
