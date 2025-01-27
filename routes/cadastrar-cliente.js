const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/auth');
const { db } = require('../db'); // Importe a conexão com o banco de dados

router.post('/', autenticar, async (req, res) => {
  const { nome, endereco, telefone, documento, informacoes } = req.body; 
  const id_vendedor = req.usuario.id;

  try {
    // 1. Validações (adicione mais validações conforme necessário)
    if (!nome || !id_vendedor) {
      return res.status(400).json({ error: 'Nome do cliente e ID do vendedor são obrigatórios.' });
    }

    // 2. Inserir o novo cliente no banco de dados
    const sql = `INSERT INTO clientes (nome, endereco, telefone, documento, informacoes, id_vendedor) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [nome, endereco, telefone, documento, informacoes, id_vendedor];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar cliente:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
      }

      console.log('Cliente cadastrado com sucesso!');
      return res.status(201).json({ message: 'Cliente cadastrado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
  }
});

module.exports = router;