const https = require('https');

// Função utilitária nativa que faz requisições HTTPS e fura bloqueios de ambiente do fetch global
function consultaUbisoft(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 4000
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
        } else { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

module.exports = async (req, res) => {
  console.log("--- EXECUÇÃO DA API BLINDADA INDIVIDUAL ---");
  
  try {
    // Libera os cabeçalhos de segurança CORS para testes locais e em produção
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const apiKey = process.env.BRAWLHALLA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Configuração incompleta: API Key ausente nas Environment Variables do Vercel." });
    }

    const bhidCobaia = 122711961;
    const urlRanked = `https://brawlhalla.com{bhidCobaia}/ranked?api_key=${apiKey}`;
    const urlStats = `https://brawlhalla.com{bhidCobaia}/stats?api_key=${apiKey}`;
    
    // Executa as duas consultas síncronas de forma isolada e segura
    const dataRanked = await consultaUbisoft(urlRanked);
    const dataStats = await consultaUbisoft(urlStats);

    // Tratamento completo dos dados competitivos da temporada
    const ratingAtual = dataRanked?.rating || 0;
    const gamesRanked = dataRanked?.games || 0;
    const winrateRanked = gamesRanked > 0 ? ((dataRanked.wins / gamesRanked) * 100).toFixed(1) + '%' : '0%';

    // Tratamento completo dos dados históricos gerais da conta
    const totalGamesGeral = dataStats?.games || 0;
    const winrateGeral = totalGamesGeral > 0 ? ((dataStats.wins / totalGamesGeral) * 100).toFixed(1) + '%' : '0%';

    const updated = [{
      nome: "Old_Kaiser_",
      bhid: bhidCobaia,
      clan_xp: 452810, // Registro fixado temporariamente para o layout cobaia
      joined_clan_timestamp: 1685000000, // Registro fixado temporariamente para o layout cobaia
      
      // Temporada Atual
      rating: ratingAtual,
      peak_rating: dataRanked?.peak_rating || ratingAtual || 0,
      tier: dataRanked?.tier || 'Sem Rank',
      region: dataRanked?.region || 'N/A',
      wins: dataRanked?.wins || 0,
      games: gamesRanked,
      winrate: winrateRanked,
      
      // Histórico Geral da Conta
      level: dataStats?.level || 'N/A',
      xp: dataStats?.xp || 0,
      total_wins: dataStats?.wins || 0,
      total_games: totalGamesGeral,
      total_winrate: winrateGeral
    }];

    return res.status(200).json(updated);

  } catch (err) {
    console.error("ERRO COMPILADOR CRÍTICO:", err.message);
    return res.status(500).json({ error: "Erro interno no servidor backend." });
  }
};
