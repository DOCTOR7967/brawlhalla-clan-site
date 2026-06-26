const https = require("https");
const DEFAULT_IDS = ["81437113"];

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
              resolve(null);
              return;
            }

            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      })
      .on("error", () => {
        resolve(null);
      });
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

    winrate: p?.games
      ? ((p.wins / p.games) * 100).toFixed(2)
      : "0.00"
  };
}

async function getRankedPlayers(ids = DEFAULT_IDS) {

  const idList = Array.isArray(ids)
    ? ids
    : String(ids).split(",");

  const rawPlayers = (
    await Promise.all(
      idList.map((id) =>
        fetchJson(
          `https://api.brawlhalla.com/v1/player/stats?brawlhalla_id=${id}`
        )
      )
    )
  ).filter(Boolean);

  return rawPlayers
    .map(normalizePlayer)
    .sort((a, b) => b.elo - a.elo)
    .map((player, index) => ({
      position: index + 1,
      ...player
    }));
}

module.exports = {
  fetchJson,
  getRankedPlayers,
};