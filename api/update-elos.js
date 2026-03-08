module.exports = async (req, res) => {
  try {
    // Lista de membros hardcoded para teste rápido (depois você pode ler do members.json com fetch se quiser)
    const members = [
      { nome: "Old_kaiser_", bhid: 122711961 },
      // { nome: "Amigol", bhid: 99999999 }  // descomente e troque pelo ID real se quiser adicionar
    ];

    const updated = [];

    for (const member of members) {
      // Proxy alternativo mais estável (BHAPI - testado em março 2026)
      const url = `https://bhapi.338.rocks/player/${member.bhid}/ranked`;

      // Alternativa 2: se o BHAPI não funcionar, descomente essa linha e comente a de cima
      // const url = `https://brawlhalla.vercel.app/api/player/${member.bhid}/ranked`;

      const response = await fetch(url);

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

      updated.push({
        nome: member.nome,
        bhid: member.bhid,
        rating: data.rating || 'N/A',
        peak_rating: data.peak_rating || 'N/A',
        tier: data.tier || 'N/A',
        region: data.region || 'N/A',
        wins: data.wins || 0,
        games: data.games || 0
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