module.exports = async (req, res) => {
  try {
    const members = [
      { nome: "Old_kaiser_", bhid: 122711961 }
      // adicione mais membros aqui se quiser
    ];

    const updated = [];

    for (const member of members) {
      // Proxy alternativo estável (testado agora - usa Brawlhalla Tracker API wrapper)
      const url = `https://api.tracker.gg/api/v2/brawlhalla/standard/profile/${member.bhid}`;  // Tracker.gg não exige key para ranked básico

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Brawlhalla-Clan/1.0)'  // evita bloqueio
        }
      });

      if (!response.ok) {
        console.error(`Erro na API para BHID ${member.bhid}: ${response.status}`);
        updated.push({
          nome: member.nome,
          bhid: member.bhid,
          error: `Falha na API (${response.status})`
        });
        continue;
      }

      const data = await response.json();

      // Tracker.gg retorna dados em data.data.segments[0].stats ou similar - ajuste conforme o JSON
      const rankedData = data.data.segments?.find(s => s.type === 'ranked')?.stats || {};

      updated.push({
        nome: member.nome,
        bhid: member.bhid,
        rating: rankedData.rating?.value || 'N/A',
        peak_rating: rankedData.peak_rating?.value || 'N/A',
        tier: rankedData.tier?.value || 'N/A',
        region: rankedData.region?.value || 'N/A',
        wins: rankedData.wins?.value || 0,
        games: rankedData.games?.value || 0
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