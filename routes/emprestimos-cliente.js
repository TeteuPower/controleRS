const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/:idCliente', autenticar, (req, res) => {
  const idCliente = req.params.idCliente;
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  // 1. Obter empréstimos mensais
    const sqlMensais = `
    SELECT 
      em.id, 
      em.valor_total, 
      em.taxa_juros, 
      em.data_inicio, 
      em.tipo,
      em.data_termino, 
      COALESCE(SUM(pm.valor_pago), 0) AS valor_pago, -- Calcula a soma dos pagamentos
      em.status,
      c.nome AS nome_cliente
    FROM 
      emprestimos_mensais em
    JOIN 
      clientes c ON em.id_cliente = c.id
    LEFT JOIN  -- Junta com a tabela de pagamentos (mensais)
      pagamentos_mensais pm ON em.id = pm.id_emprestimo
    WHERE 
      em.id_cliente = ? 
      AND em.id_vendedor = ? -- Não esqueça de filtrar pelo vendedor!
      AND em.status IN ('ativo', 'atrasado', 'aguardando')
    GROUP BY em.id;
  `;

  // 2. Obter empréstimos diários
    const sqlDiarios = `
    SELECT 
      ed.id, 
      ed.valor_total, 
      ed.taxa_juros, 
      ed.data_inicio, 
      ed.tipo,
      COALESCE(SUM(pd.valor_pago), 0) AS valor_pago,
      ed.numero_dias, 
      ed.status,
      c.nome AS nome_cliente
    FROM 
      emprestimos_diarios ed
    JOIN 
      clientes c ON ed.id_cliente = c.id
    LEFT JOIN
      pagamentos_diarios pd ON ed.id = pd.id_emprestimo
    WHERE 
      ed.id_cliente = ? 
      AND ed.id_vendedor = ?
      AND ed.status IN ('ativo', 'atrasado', 'aguardando')
    GROUP BY ed.id;
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