module.exports = (req, res) => {
  res.status(200).json([
    { name: "TESTE 1", elo: 2000 },
    { name: "TESTE 2", elo: 1800 }
  ]);
};
