import express from "express";
import dbConnect from "./config/db.js";
import dotenv from "dotenv";
import todoRoute from "./routes/todoRoute.js";
dotenv.config({ path: "../../.env" });
const app=express();

app.use(express.json())

app.use("/api",todoRoute);

await dbConnect();

app.listen(5000,()=>{
    console.log("Server is running on port 5000");
})