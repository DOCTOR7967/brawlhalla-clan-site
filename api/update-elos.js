module.exports = async (req, res) => {
          try {
              // Hardcoded para teste (depois leia do members.json com fetch ou Blob)
                  const members = [
                        { nome: "Old_kaiser_", bhid: 122711961 }
                            ];

                                const updated = [];

                                    for (const member of members) {
                                          const url = `https://brawlhalla-corehalla-proxy.vercel.app/player/${member.bhid}/ranked`;

                                                const response = await fetch(url);

                                                      if (!response.ok) {
                                                              updated.push({ ...member, error: `Falha na API (${response.status})` });
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
                                                                                                                                                                                                  res.status(500).json({ error: 'Erro interno: ' + err.message });
                                                                                                                                                                                                    }
                                                                                                                                                                                                    };
}