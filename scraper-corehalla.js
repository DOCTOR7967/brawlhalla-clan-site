const axios = require("axios");
const cheerio = require("cheerio");

async function getPlayer(id) {
  const url = `https://corehalla.com/stats/player/${id}`;

    const { data } = await axios.get(url, {
        headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                    "Accept": "text/html,application/xhtml+xml"
                        }
                          });

                            const $ = cheerio.load(data);

                              const result = {};

                                // PLAYER INFO
                                  result.player = {
                                      name: $("h1.font-bold").clone().children().remove().end().text().trim(),
                                          id: $("span.text-xs").text().replace("#", "").trim(),
                                              flag: "https://corehalla.com" + $("h1 img").attr("src")
                                                };

                                                  // ACCOUNT INFO
                                                    result.account = {};

                                                      // COMBAT INFO (exemplo de como parsear a seção combat)
                                                        result.combat = {};

                                                          $(".stat-value").each((i, el) => {
                                                              const text = $(el).text().trim();

                                                                  if (text.includes("KOs")) {
                                                                        result.combat.kos = text.replace("KOs", "").trim();
                                                                            }
                                                                                if (text.includes("Falls")) {
                                                                                      result.combat.falls = text.replace("Falls", "").trim();
                                                                                          }
                                                                                              if (text.includes("Suicides")) {
                                                                                                    result.combat.suicides = text.replace("Suicides", "").trim();
                                                                                                        }
                                                                                                            if (text.includes("Team KOs")) {
                                                                                                                  result.combat.teamKos = text.replace("Team KOs", "").trim();
                                                                                                                      }
                                                                                                                          if (text.includes("Damage dealt")) {
                                                                                                                                result.combat.damageDealt = text.replace("Damage dealt", "").trim();
                                                                                                                                    }
                                                                                                                                        if (text.includes("Damage taken")) {
                                                                                                                                              result.combat.damageTaken = text.replace("Damage taken", "").trim();
                                                                                                                                                  }
                                                                                                                                                    });

                                                                                                                                                      // RETURN
                                                                                                                                                        return result;
                                                                                                                                                        }

                                                                                                                                                        getPlayer("122711961")
                                                                                                                                                          .then(data => console.log(JSON.stringify(data, null, 2)))
                                                                                                                                                            .catch(console.error);