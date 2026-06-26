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

// 🔥 pega membros da guilda
async function getGuildMembers(guildId) {
  const url = `https://api.brawlhalla.com/v1/guild/${guildId}`;
  const data = await fetchJson(url);
  return data?.guild?.members || [];
}

// 🔥 pega ranked 1v1
async function getRanked(id) {
  const url = `https://api.brawlhalla.com/player/${id}/ranked`;
  const data = await fetchJson(url);

  return {
    id,
    name: data?.name || "Desconhecido",
    elo: data?.rating || 0,
    peak: data?.peak_rating || 0,
    wins: data?.wins || 0,
    games: data?.games || 0,
    winrate: data?.games ? ((data.wins / data.games) * 100).toFixed(1) : "0.0"
  };
}

// 🔥 função principal
async function getTop12Guild(guildId = "2616831") {
  const members = await getGuildMembers(guildId);

  const rankedPlayers = await Promise.all(
    members.map((m) => getRanked(m.brawlhalla_id))
  );

  return rankedPlayers
    .filter((p) => p && p.elo > 0)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 12)
    .map((p, index) => ({
      position: index + 1,
      ...p
    }));
}

module.exports = { getTop12Guild };
