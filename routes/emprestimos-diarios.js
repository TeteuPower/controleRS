const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

//Resgata todos os empréstimos do cliente
router.get('/', autenticar, (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  const sql = `
    SELECT 
      ed.id, 
      c.nome AS nome_cliente, 
      ed.valor_total, 
      ed.taxa_juros, 
      ed.numero_dias, 
      ed.data_inicio,
      ed.tipo,
      ed.status,
      ed.dias_atraso,
      (SELECT SUM(valor_pago) FROM pagamentos_diarios WHERE id_emprestimo = ed.id) AS total_pago,
      (ed.valor_total * ((ed.taxa_juros / 100)+1)) AS valor_total_com_juros,
      CAST(ROUND((SELECT SUM(valor_pago) FROM pagamentos_diarios WHERE id_emprestimo = ed.id) / (ed.valor_total * (((ed.taxa_juros / 100)+1)/ed.numero_dias))) AS UNSIGNED) AS parcelas_pagas,
      (ed.valor_total * ((ed.taxa_juros / 100) + 1))/ed.numero_dias AS valor_parcela
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

//Resgata um empréstimo diário específico do cliente
router.get('/:id', autenticar, (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT
  const id = req.params.id;

  const sql = `
    SELECT 
      ed.id, 
      c.nome AS nome_cliente, 
      ed.valor_total, 
      ed.taxa_juros, 
      ed.numero_dias, 
      ed.data_inicio,
      ed.tipo,
      ed.status,
      (SELECT SUM(valor_pago) FROM pagamentos_diarios WHERE id_emprestimo = ed.id) AS total_pago,
      (ed.valor_total * ((ed.taxa_juros / 100)+1)) AS valor_total_com_juros,
      CAST(ROUND((SELECT SUM(valor_pago) FROM pagamentos_diarios WHERE id_emprestimo = ed.id) / (ed.valor_total * (((ed.taxa_juros / 100)+1)/ed.numero_dias))) AS UNSIGNED) AS parcelas_pagas,
      (ed.valor_total * ((ed.taxa_juros / 100) + 1))/ed.numero_dias AS valor_parcela
    FROM 
      emprestimos_diarios ed
    JOIN 
      clientes c ON ed.id_cliente = c.id
    WHERE 
      ed.id_vendedor = ? AND ed.id = ?
  `;

  db.query(sql, [idVendedor, id], (err, results) => {
    if (err) {
      console.error('Erro ao buscar empréstimo diário:', err);
      return res.status(500).json({ error: 'Erro ao buscar empréstimo diário.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Empréstimo diário não encontrado.' });
    }

    return res.json(results[0]);
  });
});

module.exports = router;