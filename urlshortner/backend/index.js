import express from "express";
import { dbConnect } from "./config/db.js";
import { postUrl, getUrl } from "./controllers/urlShortnerController.js";
import { redisClient } from "./config/redis.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("URL shortener backend is running");
});

app.post("/shorten", postUrl);
app.get("/:shortCode", getUrl);

const PORT = 3000;

const withRetry = async (fn, label, { retries = 10, delayMs = 3000 } = {}) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await fn();
      return;
    } catch (error) {
      console.error(
        `${label} connection attempt ${attempt}/${retries} failed: ${error.message}`,
      );
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

await withRetry(dbConnect, "MongoDB");
await withRetry(() => redisClient.connect(), "Redis");

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
