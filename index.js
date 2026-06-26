bla = process.cwd();
const express = require("express");
const path = require("path");
const { getRankedPlayers } = require("./api/update-elos");
const app = express();
const PORT = process.env.PORT || 3000;


const DEFAULT_IDS = ["81437113"];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./public" , "/index.html"));
})
app.set("json spaces", 2);
app.use(express.static("public"));
app.use(express.json());

app.get("/api/update-elos", async (req, res) => {
  try {
    console.log("ROTA CHAMADA");

    const players = await getRankedPlayers();

    console.log("PLAYERS:", players);

    res.json(players);

  } catch (err) {
    console.error("ERRO REAL:", err); // 🔥 isso aqui é o mais importante

    res.status(500).json({
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});