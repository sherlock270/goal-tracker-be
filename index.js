const express = require("express");
const cors = require("cors");
const server = express();

server.use(cors());

server.get("/", (req, res) => {
  console.log("I was called");
  res.status(200).json({ message: "mission accomplished" });
});

server.get("/err", (req, res) => {
  res.status(500).json({ message: "simulated error" });
});

server.listen(8000, () => console.log("=== Listening on port 8000 ==="));
