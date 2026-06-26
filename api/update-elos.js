import https from "https";

function fetchJson(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = "";

      res.on("data", (c) => (data += c));

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

// 🔥 USANDO DADOS REAIS DA GUILDA (FUNCIONA SEM API BUGADA)
const GUILD_ID = 2616831;

async function getGuild() {
  const data = await fetchJson(
    `https://api.brawlhalla.com/v1/guild?guild_id=${GUILD_ID}`
  );

  return data?.guild_members || [];
}

export default async function handler(req, res) {
  try {
    const members = await getGuild();

    const top12 = members
      .sort((a, b) => (b.guild_points || 0) - (a.guild_points || 0))
      .slice(0, 12)
      .map((p, i) => ({
        position: i + 1,
        id: p.brawlhalla_id,
        name: p.name,
        elo: p.guild_points || 0
      }));

    res.status(200).json(top12);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
