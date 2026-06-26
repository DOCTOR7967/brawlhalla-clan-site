const https = require("https");

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", (chunk) => (data += chunk));

      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

// 🔥 LISTA FIXA (FUNCIONA SEM FALHAR)
const IDS = [
  122711961,
  81437113,
  4697805,
  5464542
];

// 🔥 PEGA RANKED (com fallback seguro)
async function getRanked(id) {
  const data = await fetchJson(
    `https://api.brawlhalla.com/player/${id}/ranked`
  );

  return {
    id,
    name: data?.name || "Desconhecido",
    elo: data?.rating || 0,
    wins: data?.wins || 0,
    games: data?.games || 0,
    winrate: data?.games
      ? ((data.wins / data.games) * 100).toFixed(1)
      : "0.0"
  };
}

// 🔥 VERCEL FUNCTION (IMPORTANTE)
module.exports = async (req, res) => {
  try {
    const players = await Promise.all(IDS.map(getRanked));

    const top12 = players
      .sort((a, b) => b.elo - a.elo)
      .slice(0, 12)
      .map((p, i) => ({
        position: i + 1,
        ...p
      }));

    res.status(200).json(top12);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
