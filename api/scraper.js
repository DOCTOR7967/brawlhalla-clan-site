const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  console.log("Scraper chamado para ID:", req.query.id || "122711961");

  try {
    const id = req.query.id || "122711961";
    const url = `https://corehalla.com/stats/player/${id}`;

    console.log("Tentando acessar:", url);

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://corehalla.com/"
      },
      timeout: 10000 // 10 segundos de timeout
    });

    console.log("HTML recebido, tamanho:", data.length);

    const $ = cheerio.load(data);

    const result = {
      player: {
        name: $("h1.font-bold").clone().children().remove().end().text().trim() || "N/A",
        id: id,
        flag: "https://corehalla.com" + ($("h1 img").attr("src") || "")
      },
      ranked: {
        rating: "N/A",
        peak: "N/A",
        tier: "N/A",
        region: "N/A",
        wins: "N/A",
        games: "N/A"
      }
    };

    // Parsing simples e genérico
    $("div, span").each((i, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text.includes("rating")) {
        result.ranked.rating = $(el).next().text().trim() || text.split("rating")[1]?.trim() || "N/A";
      }
      if (text.includes("tier") || text.includes("rank")) {
        result.ranked.tier = $(el).next().text().trim() || text.split("tier")[1]?.trim() || "N/A";
      }
      if (text.includes("region")) {
        result.ranked.region = $(el).next().text().trim() || text.split("region")[1]?.trim() || "N/A";
      }
      if (text.includes("wins")) {
        result.ranked.wins = $(el).next().text().trim() || text.split("wins")[1]?.trim() || "N/A";
      }
      if (text.includes("games")) {
        result.ranked.games = $(el).next().text().trim() || text.split("games")[1]?.trim() || "N/A";
      }
    });

    console.log("Dados extraídos:", result);
    res.status(200).json(result);
  } catch (err) {
    console.error("Erro no scraper:", err.message);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Dados da resposta:", err.response.data.substring(0, 200));
    }
    res.status(500).json({ error: "Falha ao puxar dados: " + err.message });
  }
};