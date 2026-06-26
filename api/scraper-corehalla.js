const axios = require("axios");
const cheerio = require("cheerio");

async function getPlayer(id) {
  const url = `https://corehalla.com/stats/player/${id}`;

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "text/html,application/xhtml+xml"
    },
    timeout: 10000
  });

  const $ = cheerio.load(data);

  const flagSrc = $("h1 img").attr("src");

  const result = {
    player: {
      name: $("h1.font-bold")
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .trim() || "N/A",

      id: $("span.text-xs").text().replace("#", "").trim() || id,

      flag: flagSrc ? `https://corehalla.com${flagSrc}` : null
    },

    ranked: {},
    overall: {},
    combat: {},
    account: {},
    mainLegends: []
  };

  return result;
}

module.exports = getPlayer;