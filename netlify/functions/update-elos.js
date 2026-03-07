const { schedule } = require('@netlify/functions');
const fs = require('fs').promises;
const path = require('path');

const MEMBERS_FILE = path.join(__dirname, '../../members.json');
const OUTPUT_FILE = path.join(__dirname, '../../data/rankings.json');

exports.handler = schedule('@daily', async () => {
  try {
      // Lê a lista de membros
          const membersData = await fs.readFile(MEMBERS_FILE, 'utf8');
              const members = JSON.parse(membersData);

                  const updated = [];

                      for (const member of members) {
                            // Proxy Corehalla sem key (funciona para BHID 122711961)
                                  const url = `https://brawlhalla-corehalla-proxy.vercel.app/player/${member.bhid}/ranked`;

                                        const res = await fetch(url);

                                              if (!res.ok) {
                                                      console.error(`Erro na API para BHID ${member.bhid}: ${res.status}`);
                                                              updated.push({
                                                                        ...member,
                                                                                  error: `Falha na API (${res.status})`
                                                                                          });
                                                                                                  continue;
                                                                                                        }

                                                                                                              const data = await res.json();

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

                                                                                                                                                                                                  // Cria pasta e salva o JSON com os elos
                                                                                                                                                                                                      await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
                                                                                                                                                                                                          await fs.writeFile(OUTPUT_FILE, JSON.stringify(updated, null, 2));

                                                                                                                                                                                                              return {
                                                                                                                                                                                                                    statusCode: 200,
                                                                                                                                                                                                                          body: JSON.stringify({ message: 'Elos atualizados com sucesso', count: updated.length })
                                                                                                                                                                                                                              };
                                                                                                                                                                                                                                } catch (err) {
                                                                                                                                                                                                                                    console.error('Erro na function:', err.message);
                                                                                                                                                                                                                                        return {
                                                                                                                                                                                                                                              statusCode: 500,
                                                                                                                                                                                                                                                    body: 'Erro interno ao atualizar elos: ' + err.message
                                                                                                                                                                                                                                                        };
                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                          });