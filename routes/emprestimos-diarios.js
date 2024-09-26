const express = require('express');
const router = express.Router();
const db = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/', autenticar, (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  const sql = `
    SELECT 
      ed.id, 
      c.nome AS nome_cliente, 
      ed.valor_total, 
      ed.taxa_juros, 
      ed.numero_dias, 
      ed.status,
      (SELECT SUM(valor_pago) FROM pagamentos_diarios WHERE id_emprestimo = ed.id) AS total_pago
    FROM 
      emprestimos_diarios ed
    JOIN 
      clientes c ON ed.id_cliente = c.id
    WHERE 
      ed.id_vendedor = ?
  `;

  db.query(sql, [idVendedor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar empréstimos diários:', err);
      return res.status(500).json({ error: 'Erro ao buscar empréstimos diários.' });
    }

    return res.json(results);
  });
});

module.exports = router;