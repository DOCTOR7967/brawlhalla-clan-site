const express = require("express");
const path = require("path");
const { getTop12Guild } = require("./api/update-elos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 RANKING 12 MELHORES
app.get("/api/update-elos", async (req, res) => {
  try {
    const data = await getTop12Guild("2616831");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});