const express = require('express');
const router = express.Router();
const db = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/:idCliente', autenticar, (req, res) => {
  const idCliente = req.params.idCliente;
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  // 1. Obter empréstimos mensais
  const sqlMensais = `
    SELECT 
      id, 
      valor_total, 
      taxa_juros, 
      data_inicio, 
      data_termino, 
      valor_pago,
      tipo,
      status 
    FROM 
      emprestimos_mensais 
    WHERE 
      id_cliente = ? 
      AND status IN ('ativo', 'atrasado', 'aguardando')
  `;

  // 2. Obter empréstimos diários
  const sqlDiarios = `
    SELECT 
      id, 
      valor_total, 
      taxa_juros, 
      data_inicio, 
      valor_pago,
      numero_dias, 
      tipo,
      status 
    FROM 
      emprestimos_diarios 
    WHERE 
      id_cliente = ? 
      AND status IN ('ativo', 'atrasado', 'aguardando')
  `;

  // Executar as consultas em paralelo
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(sqlMensais, [idCliente, idVendedor], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(sqlDiarios, [idCliente, idVendedor], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    }),
  ])
    .then(([emprestimosMensais, emprestimosDiarios]) => {
      // Combinar os resultados das duas consultas
      const emprestimos = [...emprestimosMensais, ...emprestimosDiarios];

      return res.json(emprestimos);
    })
    .catch((err) => {
      console.error('Erro ao buscar empréstimos:', err);
      return res.status(500).json({ error: 'Erro ao buscar empréstimos.' });
    });
});

module.exports = router;