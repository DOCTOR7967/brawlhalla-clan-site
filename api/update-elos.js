const fs = require('fs').promises;
const path = require('path');

const MEMBERS_FILE = path.join(__dirname, '../members.json');
const OUTPUT_FILE = path.join(__dirname, '../data/rankings.json');

module.exports = async (req, res) => {
  try {
      const membersData = await fs.readFile(MEMBERS_FILE, 'utf8');
          const members = JSON.parse(membersData);

              const updated = [];

                  for (const member of members) {
                        const url = `https://brawlhalla-corehalla-proxy.vercel.app/player/${member.bhid}/ranked`;

                              const response = await fetch(url);

                                    if (!response.ok) {
                                            console.error(`Erro na API para BHID ${member.bhid}: ${response.status}`);
                                                    updated.push({
                                                              ...member,
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

                                                                                                                                                                                        await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
                                                                                                                                                                                            await fs.writeFile(OUTPUT_FILE, JSON.stringify(updated, null, 2));

                                                                                                                                                                                                res.status(200).json({ message: 'Elos atualizados com sucesso', count: updated.length });
                                                                                                                                                                                                  } catch (err) {
                                                                                                                                                                                                      console.error('Erro na function:', err.message);
                                                                                                                                                                                                          res.status(500).json({ error: 'Erro interno ao atualizar elos: ' + err.message });
                                                                                                                                                                                                            }
                                                                                                                                                                                                            };