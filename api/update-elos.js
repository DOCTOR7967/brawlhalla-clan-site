import https from "https";

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

export default async function handler(req, res) {
  try {
    const apiKey = process.env.BRAWLHALLA_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API key não encontrada no Vercel" });
    }

    const ids = (req.query.ids || "81437113").split(",");

    const players = await Promise.all(
      ids.map(async (id) => {
        const ranked = await fetchJson(
          `https://api.brawlhalla.com/ranked/${id}?api_key=${apiKey}`
        );

        return {
          id,
          name: ranked?.name || "Desconhecido",
          elo: ranked?.rating || 0,
          wins: ranked?.wins || 0,
          games: ranked?.games || 0,
          winrate: ranked?.games
            ? ((ranked.wins / ranked.games) * 100).toFixed(1)
            : "0.0"
        };
      })
    );

    const sorted = players
      .filter((p) => p.name !== "Desconhecido")
      .sort((a, b) => b.elo - a.elo)
      .map((p, i) => ({
        position: i + 1,
        ...p
      }));

    return res.status(200).json(sorted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
