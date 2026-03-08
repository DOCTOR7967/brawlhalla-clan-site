module.exports = async (req, res) => {
  try {
    const members = [
      { nome: "Old_kaiser_", bhid: 122711961 }
      // { nome: "Amigol", bhid: 12345678 } // adicione se quiser
    ];

    const updated = [];

    for (const member of members) {
      const url = `https://api.tracker.gg/api/v2/brawlhalla/standard/profile/${member.bhid}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Sem texto');
        console.error(`Erro Tracker.gg para BHID ${member.bhid}: ${response.status} - ${errorText}`);
        updated.push({
          nome: member.nome,
          bhid: member.bhid,
          error: `Falha na API (${response.status})`
        });
        continue;
      }

      const json = await response.json();

      const rankedSegment = json.data?.segments?.find(s => s.type === 'ranked') || {};
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
    console.error('Erro completo na function:', err.stack || err.message);
    res.status(500).json({
      error: 'Erro interno ao atualizar elos: ' + (err.message || 'Fetch falhou - verifique o proxy')
    });
  }
};