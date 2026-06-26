import https from "https";

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (resp) => {
      let data = "";

      resp.on("data", (c) => (data += c));

      resp.on("end", () => {
        try {
          if (resp.statusCode !== 200) return resolve(null);
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on("error", () => resolve(null));
  });
}

function normalizePlayer(p) {
  return {
    id: p?.brawlhalla_id,
    name: p?.name || "Unknown",

    // 🔥 AQUI ESTÁ O CORRETO (ranked)
    elo: p?.rating || p?.peak_rating || 0,

    peakElo: p?.peak_rating || 0,
    tier: p?.tier || "N/A",

    wins: p?.wins || 0,
    games: p?.games || 0,

    winrate: p?.games
      ? ((p.wins / p.games) * 100).toFixed(2)
      : "0.00"
  };
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.BRAWLHALLA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API Key" });
    }

    const ids = (req.query.ids || "81437113").split(",");

    const rawPlayers = await Promise.all(
      ids.map((id) =>
        fetchJson(
          `https://api.brawlhalla.com/v1/ranked/${id}?api_key=${apiKey}`
        )
      )
    );

    const players = rawPlayers
      .filter(Boolean)
      .map(normalizePlayer)
      .sort((a, b) => b.elo - a.elo)
      .map((p, i) => ({
        position: i + 1,
        ...p
      }));

    return res.status(200).json(players);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
}
