const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/', autenticar, (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  const sql = 'SELECT id, nome FROM clientes WHERE id_vendedor = ?';
  db.query(sql, [idVendedor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar clientes:', err);
      return res.status(500).json({ error: 'Erro ao buscar clientes.' });
    }

    return res.json(results);
  });
});

module.exports = router;