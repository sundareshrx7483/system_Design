import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { dbConnect } from "@/lib/mongodb";
import { Url } from "@/models/url";
export async function POST(req) {
  const body = await req.json();

  const { originalUrl } = body;

  if (!originalUrl) {
    return NextResponse.json(
      { error: "Original URL is required" },
      { status: 400 },
    );
  }
  const shortCode = nanoid(4);
  await dbConnect();

   const url= new Url({
    originalUrl,
    shortUrl: shortCode,
  });
  const res = await url.save();
  if (!res) {
    return NextResponse.json(
      { error: "Failed to shorten URL" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      message: "URL shortened successfully",
      originalUrl,
      shortCode,
    },
    { status: 200 },
  );
}
