import https from "https";

const API_KEY = "A27820UWGN2V3AO4A0MI";

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

// 🔥 IDS DA SUA GUILDA
const IDS = [
  122711961,
  81437113,
  4697805,
  5464542
];

// 🔥 PEGA STATS COM API KEY
async function getPlayer(id) {
  const data = await fetchJson(
    `https://api.brawlhalla.com/v1/stats/player/${id}?api_key=${API_KEY}`
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

export default async function handler(req, res) {
  try {
    const players = await Promise.all(IDS.map(getPlayer));

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
}
