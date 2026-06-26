import https from "https";

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (resp) => {
      let data = "";

      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", () => {
        try {
          if (resp.statusCode !== 200) {
            resolve(null);
            return;
          }

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
    id: p?.brawlhalla_id || null,
    name: p?.name || "Unknown",

    elo: p?.rating || p?.classificacao || 0,
    peakElo: p?.peak_rating || 0,

    tier: p?.tier || "N/A",
    region: p?.region || p?.regiao || "N/A",

    wins: p?.wins || 0,
    games: p?.games || 0,

    winrate: p?.games
      ? ((p.wins / p.games) * 100).toFixed(2)
      : "0.00"
  };
}

const DEFAULT_IDS = ["81437113"];

export default async function handler(req, res) {
  try {
    const apiKey = process.env.BRAWLHALLA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API Key" });
    }

    let { ids } = req.query;

    if (!ids) {
      ids = DEFAULT_IDS.join(",");
    }

    const idList = ids.split(",");

    const rawPlayers = (
      await Promise.all(
        idList.map((id) =>
          fetchJson(
            `https://api.brawlhalla.com/player/${id}/stats?api_key=${apiKey}`
          )
        )
      )
    ).filter(Boolean);

    const players = rawPlayers.map(normalizePlayer);

    players.sort((a, b) => b.elo - a.elo);

    const ranked = players.map((p, index) => ({
      position: index + 1,
      ...p
    }));

    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=30"
    );

    return res.status(200).json(ranked);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
