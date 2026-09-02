import express from "express";
import dbConnect from "./config/db.js";


import getCounterRoute from "./routes/counterRoute.js";
const app = express();
app.use(express.json());
await dbConnect();

app.get("/", (req, res) => {
  res.send("Counter backend is running");
});

app.use("/api/counter", getCounterRoute());

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
