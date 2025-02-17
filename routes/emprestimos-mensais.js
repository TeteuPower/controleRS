const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/', autenticar, (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  const sql = `
    SELECT 
      em.id, 
      c.nome AS nome_cliente, 
      em.valor_total, 
      em.taxa_juros, 
      em.tipo,
      em.data_inicio,
      em.data_termino, 
      em.status,
      (SELECT SUM(valor_pago) FROM pagamentos_mensais WHERE id_emprestimo = em.id) AS total_pago,
      (em.valor_total * (em.taxa_juros / 100)) AS parcela
    FROM 
      emprestimos_mensais em
    JOIN 
      clientes c ON em.id_cliente = c.id
    WHERE 
      em.id_vendedor = ?
  `;

  db.query(sql, [idVendedor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar empréstimos mensais:', err);
      return res.status(500).json({ error: 'Erro ao buscar empréstimos mensais.' });
    }

    return res.json(results);
  });
});

module.exports = router;