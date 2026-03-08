module.exports = async (req, res) => {
  try {
    const updated = [
      {
        nome: "Old_kaiser_",
        bhid: 122711961,
        rating: 2004,
        peak_rating: 2004,
        tier: "Diamond",
        region: "BRZ",
        wins: 53,
        games: 66
      }
      // Adicione mais membros aqui quando quiser
    ];

    res.status(200).json({
      message: 'Elos atualizados com sucesso',
      count: updated.length,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno: ' + err.message });
  }
};