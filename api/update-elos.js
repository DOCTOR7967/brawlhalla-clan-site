module.exports = async (req, res) => {
  try {
    // Lista de membros (você pode manter hardcoded para teste ou ler de members.json depois)
    const members = [
      { nome: "Old_kaiser_", bhid: 122711961 }
      // Adicione mais membros aqui se quiser:
      // { nome: "Amigol", bhid: 12345678 },
    ];

    const updated = [];

    for (const member of members) {
      // Proxy Tracker.gg (mais estável e sem bloqueio frequente em 2026)
      const url = `https://api.tracker.gg/api/v2/brawlhalla/standard/profile/${member.bhid}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Brawlhalla-Clan-App/1.0 (Personal Project)'  // evita bloqueio como bot
        }
      });

      if (!response.ok) {
        console.error(`Erro Tracker.gg para BHID ${member.bhid}: ${response.status}`);
        updated.push({
          nome: member.nome,
          bhid: member.bhid,
          error: `Falha na API (${response.status})`
        });
        continue;
      }

      const json = await response.json();

      // Tracker.gg retorna dados em json.data.segments (ranked está em segments com type 'ranked')
      const rankedSegment = json.data.segments?.find(s => s.type === 'ranked') || {};
      const stats = rankedSegment.stats || {};

      updated.push({
        nome: member.nome,
        bhid: member.bhid,
        rating: stats.rating?.value || 'N/A',
        peak_rating: stats.peak_rating?.value || 'N/A',
        tier: stats.tier?.metadata?.name || 'N/A',
        region: stats.region?.metadata?.name || 'N/A',
        wins: stats.wins?.value || 0,
        games: stats.games?.value || 0
      });
    }

    res.status(200).json({
      message: 'Elos atualizados com sucesso',
      count: updated.length,
      data: updated
    });
  } catch (err) {
    console.error('Erro na function:', err.message);
    res.status(500).json({
      error: 'Erro interno ao atualizar elos: ' + err.message
    });
  }
};