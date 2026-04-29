const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Response from backend server",
    hostname: os.hostname(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", hostname: os.hostname() });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
