const { schedule } = require('@netlify/functions');
const fs = require('fs').promises;
const path = require('path');

const API_KEY = process.env.BRAWLHALLA_API_KEY;
const MEMBERS_FILE = path.join(__dirname, '../../members.json');
const OUTPUT_FILE = path.join(__dirname, '../../data/rankings.json');

exports.handler = schedule('@daily', async () => {
  try {
      // Lê a lista de membros
          const membersData = await fs.readFile(MEMBERS_FILE, 'utf8');
              const members = JSON.parse(membersData);

                  const updated = [];

                      // Para cada membro, busca os dados na API
                          for (const member of members) {
                                const url = `https://api.brawlhalla.com/player/\( {member.bhid}/ranked?api_key= \){API_KEY}`;
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
                                                                                                                                                                                  games: data.games || 0,
                                                                                                                                                                                          // Pode adicionar mais campos se quiser, ex: legend, level, etc.
                                                                                                                                                                                                });
                                                                                                                                                                                                    }

                                                                                                                                                                                                        // Cria a pasta data/ se não existir e salva o JSON atualizado
                                                                                                                                                                                                            await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
                                                                                                                                                                                                                await fs.writeFile(OUTPUT_FILE, JSON.stringify(updated, null, 2));

                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                          statusCode: 200,
                                                                                                                                                                                                                                body: JSON.stringify({
                                                                                                                                                                                                                                        message: 'Elos atualizados com sucesso',
                                                                                                                                                                                                                                                count: updated.length
                                                                                                                                                                                                                                                      })
                                                                                                                                                                                                                                                          };
                                                                                                                                                                                                                                                            } catch (err) {
                                                                                                                                                                                                                                                                console.error('Erro na function:', err);
                                                                                                                                                                                                                                                                    return {
                                                                                                                                                                                                                                                                          statusCode: 500,
                                                                                                                                                                                                                                                                                body: 'Erro interno ao atualizar elos'
                                                                                                                                                                                                                                                                                    };
                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                      });