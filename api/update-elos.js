const API_KEY = 'A27820UWGN2V3AO4A0MI';
const CLAN_ID = '2616831';
const BH_BASE = 'https://api.brawlhalla.com';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const clanRes = await fetch(`${BH_BASE}/v1/clan/${CLAN_ID}?api_key=${API_KEY}`);
    const clan = await clanRes.json();
    const members = clan.clan || [];

    const ranked = await Promise.all(
      members.map(m =>
        fetch(`${BH_BASE}/v1/player/${m.brawlhalla_id}/ranked?api_key=${API_KEY}`)
          .then(r => r.json())
          .then(r => ({
            brawlhalla_id: m.brawlhalla_id,
            name: m.name || r.name || 'Desconhecido',
            rating: r.rating || 0,
            wins: r.wins || 0,
            games: r.games || 0,
          }))
          .catch(() => ({
            brawlhalla_id: m.brawlhalla_id,
            name: m.name || 'Desconhecido',
            rating: 0, wins: 0, games: 0,
          }))
      )
    );

    const top12 = ranked
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12);

    res.status(200).json({
      clan_name: clan.clan_name,
      members: members.length,
      ranking: top12
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
