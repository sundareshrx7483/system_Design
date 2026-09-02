import UrlDetails from "../model/urlDetails.js";
import { generateShortUrl } from "../utility/shortUrl.js";
import { redisClient } from "../config/redis.js";

const CACHE_TTL_SECONDS = 3600;
const cacheKey = (shortCode) => `shortUrl:${shortCode}`;

export const postUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "originalUrl is required" });
    }

    let existingUrl = await UrlDetails.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        shortCode: existingUrl.shortCode,
        shortUrl: `${req.protocol}://${req.get("host")}/${existingUrl.shortCode}`,
      });
    }

    let shortCode = generateShortUrl();
    while (await UrlDetails.exists({ shortCode })) {
      shortCode = generateShortUrl();
    }

    const urlEntry = await UrlDetails.create({
      originalUrl,
      shortCode,
    });

    await redisClient.set(
      cacheKey(shortCode),
      originalUrl,
      "EX",
      CACHE_TTL_SECONDS,
    );

    return res.status(201).json({
      shortCode: urlEntry.shortCode,
      shortUrl: `${req.protocol}://${req.get("host")}/${urlEntry.shortCode}`,
    });
  } catch (error) {
    console.error("Error in postUrl:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Internal Server Error",
    });
  }
};

export const getUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const cachedUrl = await redisClient.get(cacheKey(shortCode));
    if (cachedUrl) {
      return res.redirect(cachedUrl);
    }

    const urlEntry = await UrlDetails.findOne({ shortCode });

    if (!urlEntry) {
      return res.status(404).json({ error: "URL not found" });
    }

    await redisClient.set(
      cacheKey(shortCode),
      urlEntry.originalUrl,
      "EX",
      CACHE_TTL_SECONDS,
    );

    return res.redirect(urlEntry.originalUrl);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Internal Server Error",
    });
  }
};
