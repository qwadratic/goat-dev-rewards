import express from "express";
import dotenv from "dotenv";
import { initEventListener } from "./listener";
import { scheduleHourlyUpdate } from "./scheduler";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Start event listeners and hourly updates
initEventListener();
scheduleHourlyUpdate();

app.get("/", (req, res) => {
  res.send("GOAT Network Backend is Running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});