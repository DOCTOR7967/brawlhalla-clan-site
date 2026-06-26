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

// 🔥 PEGAR MEMBROS CORRETO DA GUILDA
async function getGuildMembers(guildId) {
  const data = await fetchJson(
    `https://api.brawlhalla.com/v1/guild/members?guild_id=${guildId}`
  );

  return data?.guild_members || [];
}

// 🔥 RANKED 1v1
async function getRanked(id) {
  const data = await fetchJson(
    `https://api.brawlhalla.com/player/${id}/ranked`
  );

  return {
    id,
    name: data?.name || "Desconhecido",
    elo: data?.rating || 0,
    peak: data?.peak_rating || 0,
    wins: data?.wins || 0,
    games: data?.games || 0,
    winrate: data?.games
      ? ((data.wins / data.games) * 100).toFixed(1)
      : "0.0"
  };
}

// 🔥 EXPORT VERCEL (OBRIGATÓRIO)
export default async function handler(req, res) {
  try {
    const guildId = "2616831";

    const members = await getGuildMembers(guildId);

    // 🔥 DEBUG IMPORTANTE
    console.log("MEMBROS DA GUILDA:", members);

    if (!members || members.length === 0) {
      return res.status(200).json([]);
    }

    const ranked = await Promise.all(
      members.map((m) => getRanked(m.brawlhalla_id))
    );

    const top12 = ranked
      .filter((p) => p && p.elo > 0)
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
