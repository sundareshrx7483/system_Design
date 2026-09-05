import { dbConnect } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { Url } from "@/models/url";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { shortUrl } = await params;
  const cachedUrl = await redis.get(shortUrl);
  if (cachedUrl) {
    return NextResponse.redirect(cachedUrl);
  }
  await dbConnect();
  const url = await Url.findOne({ shortUrl });

  if (!url) {
    return NextResponse.json(
      { message: "Short Url NOT FOUND" },
      { status: 404 },
    );
  }
  await redis.set(shortUrl, url.originalUrl,"EX",60);

  return NextResponse.redirect(url.originalUrl);
}
