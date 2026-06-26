const https = require("https");

const DEFAULT_IDS = ["81437113"]; // adicione mais IDs aqui depois

function fetchJson(url) {
  return new Promise((resolve) => {
    https
      .get(url, (resp) => {
        let data = "";

        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          try {
            if (resp.statusCode !== 200) {
              console.log("Erro API:", data);
              resolve(null);
              return;
            }

            resolve(JSON.parse(data));
          } catch (e) {
            resolve(null);
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

function normalizePlayer(p) {
  return {
    id: p?.brawlhalla_id,
    name: p?.name || "Unknown",
    elo: p?.rating || 0,
    peakElo: p?.peak_rating || 0,
    tier: p?.tier || "N/A",
    region: p?.region || "N/A",
    wins: p?.wins || 0,
    games: p?.games || 0,
    winrate: p?.games ? ((p.wins / p.games) * 100).toFixed(2) : "0.00"
  };
}

async function getRankedPlayers(ids = DEFAULT_IDS) {
  const apiKey = process.env.BRAWLHALLA_API_KEY;

  const idList = Array.isArray(ids)
    ? ids
    : String(ids).split(",");

  const rawPlayers = await Promise.all(
    idList.map((id) =>
      fetchJson(
        `https://api.brawlhalla.com/player/${id}/ranked?api_key=${apiKey}`
      )
    )
  );

  const players = rawPlayers
    .filter(Boolean)
    .map(normalizePlayer)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 12) // 🔥 TOP 12
    .map((player, index) => ({
      position: index + 1,
      ...player
    }));

  return players;
}

module.exports = {
  getRankedPlayers
};