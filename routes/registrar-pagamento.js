const express = require('express');
const router = express.Router();
const db = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação
//const cron = require('node-cron'); // Importe a biblioteca node-cron
const verificarPagamentos = require('../utils/verificarPagamentos');
verificarPagamentos();  // Chame a função para verificar os pagamentos

router.post('/diario', autenticar, (req, res) => {
  const { id_emprestimo, valor_pagamento } = req.body;

  try {
    // 1. Validações (adicione mais validações conforme necessário)
    if (!id_emprestimo || !valor_pagamento) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // 2. Inserir o pagamento na tabela `pagamentos`
    const sql = 'INSERT INTO pagamentos_diarios (id_emprestimo, data_pagamento, valor_pago) VALUES (?, CURDATE(), ?)';
    const values = [id_emprestimo, valor_pagamento];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao registrar pagamento:', err);
        return res.status(500).json({ error: 'Erro ao registrar pagamento.' });
      }

      console.log('Pagamento registrado com sucesso!');
      return res.status(201).json({ message: 'Pagamento registrado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao registrar pagamento.' });
  }
  verificarPagamentos();
});

module.exports = router;