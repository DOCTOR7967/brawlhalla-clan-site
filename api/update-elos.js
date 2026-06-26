import members from "../members.json";

export default async function handler(req, res) {
  try {
    const ranking = members
      .map((p) => ({
        id: p.brawlhalla_id,
        name: p.name || "Unknown",
        score: p.guild_points || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((p, i) => ({
        position: i + 1,
        ...p
      }));

    return res.status(200).json(ranking);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
