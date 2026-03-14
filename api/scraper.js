const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (req, res) => {
  try {
    const id = req.query.id || "122711961";

    const url = `https://corehalla.com/stats/player/${id}`;

    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Referer": "https://corehalla.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1"
      }
    });

    const $ = cheerio.load(data);

    const result = {
      player: {},
      ranked: {
        rating: "N/A",
        peak: "N/A",
        tier: "N/A",
        region: "N/A",
        wins: "N/A",
        games: "N/A",
        winrate: "N/A"
      },
      combat: {}
    };

    // Player info
    result.player.name = $("h1.font-bold").clone().children().remove().end().text().trim() || "Unknown";
    result.player.id = $("span.text-xs").text().replace("#", "").trim() || id;
    result.player.flag = "https://corehalla.com" + ($("h1 img").attr("src") || "");

    // Ranked info (parsing genérico)
    $("div, span, p, li").each((i, el) => {
      const text = $(el).text().trim().toLowerCase();

      if (text.includes("elo") || text.includes("rating")) {
        result.ranked.rating = $(el).next().text().trim() || text.split(/elo|rating/i)[1]?.trim() || "N/A";
      }
      if (text.includes("peak")) {
        result.ranked.peak = $(el).next().text().trim() || text.split(/peak/i)[1]?.trim() || "N/A";
      }
      if (text.includes("tier") || text.includes("rank")) {
        result.ranked.tier = $(el).next().text().trim() || text.split(/tier|rank/i)[1]?.trim() || "N/A";
      }
      if (text.includes("region")) {
        result.ranked.region = $(el).next().text().trim() || text.split(/region/i)[1]?.trim() || "N/A";
      }
      if (text.includes("wins")) {
        result.ranked.wins = $(el).next().text().trim() || text.split(/wins/i)[1]?.trim() || "N/A";
      }
      if (text.includes("games")) {
        result.ranked.games = $(el).next().text().trim() || text.split(/games/i)[1]?.trim() || "N/A";
      }
      if (text.includes("winrate")) {
        result.ranked.winrate = $(el).next().text().trim() || text.split(/winrate/i)[1]?.trim() || "N/A";
      }
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Erro no scraper:", err.message);
    if (err.response) console.error("Status:", err.response.status, err.response.data);
    res.status(500).json({ error: "Falha ao puxar dados do Corehalla: " + err.message });
  }
};