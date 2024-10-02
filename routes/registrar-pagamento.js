const express = require('express');
const router = express.Router();
const db = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação
const verificarStatusEmprestimo = require('../utils/verificarStatusEmprestimo');
//const cron = require('node-cron'); // Importe a biblioteca node-cron
//const verificarPagamentos = require('../utils/verificarPagamentos');
//verificarPagamentos();  // Chame a função para verificar os pagamentos

router.post('/diario', autenticar, (req, res) => {
  const { id_emprestimo, valor_pagamento, tipoEmprestimo } = req.body;

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
      //console.log(id_emprestimo);
      verificarStatusEmprestimo(id_emprestimo, tipoEmprestimo);
      console.log('Pagamento registrado com sucesso!');
      return res.status(201).json({ message: 'Pagamento registrado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao registrar pagamento.' });
  }
  //verificarPagamentos();
});

router.post('/mensal', autenticar, (req, res) => {
  const { id_emprestimo, valor_pagamento, tipoEmprestimo } = req.body;

  try {
    // 1. Validações (adicione mais validações conforme necessário)
    if (!id_emprestimo || !valor_pagamento) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // 2. Inserir o pagamento na tabela `pagamentos`
    const sql = 'INSERT INTO pagamentos_mensais (id_emprestimo, data_pagamento, valor_pago) VALUES (?, CURDATE(), ?)';
    const values = [id_emprestimo, valor_pagamento];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao registrar pagamento:', err);
        return res.status(500).json({ error: 'Erro ao registrar pagamento.' });
      }
      //console.log(id_emprestimo);
      verificarStatusEmprestimo(id_emprestimo, tipoEmprestimo);
      console.log('Pagamento registrado com sucesso!');
      return res.status(201).json({ message: 'Pagamento registrado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    return res.status(500).json({ error: 'Erro ao registrar pagamento.' });
  }
  //verificarPagamentos();
});

router.post('/mensal-quitar', autenticar, (req, res) => {
  const { id_emprestimo, status } = req.body;

  try {
    // 1. Validações (adicione mais validações conforme necessário)
    if (!id_emprestimo || !status) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // 2. Inserir o pagamento na tabela `pagamentos`
    const sql = 'UPDATE emprestimos_mensais SET status = ?, data_termino = CURDATE() WHERE id = ?';
    const values = [status, id_emprestimo];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao finalizar empréstimo', err);
        return res.status(500).json({ error: 'Erro ao finalizar empréstimo' });
      }
      console.log('Empréstimo finalizado com sucesso!');
      return res.status(201).json({ message: 'Empréstimo finalizado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao finalizar empréstimo:', error);
    return res.status(500).json({ error: 'Erro ao finalizar empréstimo' });
  }
  //verificarPagamentos();
});

module.exports = router;