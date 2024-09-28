const express = require('express');
const router = express.Router();
const db = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação
const verificarStatusEmprestimo = require('../utils/verificarStatusEmprestimo');

router.post('/', autenticar, (req, res) => {
  const { id_cliente, valor, juros, data_inicio, tipo_emprestimo, dias, vendedor_id } = req.body;
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT
  const status = 'ativo';

  try {
    // 1. Validações (adicione mais validações conforme necessário)
    if (!id_cliente || !valor || !juros || !data_inicio || !tipo_emprestimo) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (tipo_emprestimo === 'diario' && !dias) {
      return res.status(400).json({ error: 'Informe o número de dias para empréstimos diários.' });
    }

    // 2. Inserir o empréstimo na tabela correta
    let sql;
    let values;

    if (tipo_emprestimo === 'mensal') {
      sql = `INSERT INTO emprestimos_mensais (id_cliente, valor_total, taxa_juros, data_inicio, status, id_vendedor) 
             VALUES (?, ?, ?, ?, ?, ?)`;
      values = [id_cliente, valor, juros, data_inicio, status, vendedor_id];
    } else if (tipo_emprestimo === 'diario') {
      sql = `INSERT INTO emprestimos_diarios (id_cliente, valor_total, taxa_juros, data_inicio, numero_dias, status, id_vendedor) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`;
      values = [id_cliente, valor, juros, data_inicio, dias, status, vendedor_id];
    } else {
      return res.status(400).json({ error: 'Tipo de empréstimo inválido.' });
    }

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar empréstimo:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar empréstimo.' });
      }

      console.log('Empréstimo cadastrado com sucesso!');
      const idNovoEmprestimo = result.insertId;
      //console.log(idNovoEmprestimo);
      verificarStatusEmprestimo(idNovoEmprestimo, tipo_emprestimo);
      return res.status(201).json({ message: 'Empréstimo cadastrado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao cadastrar empréstimo:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar empréstimo.' });
  }
});

module.exports = router;