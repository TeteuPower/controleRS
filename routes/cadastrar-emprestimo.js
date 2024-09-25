const express = require('express');
const router = express.Router();
const db = require('../db'); 

router.post('/', async (req, res) => {
  const { id_cliente, tipo, valor_total, taxa_juros, data_inicio } = req.body;
  const id_vendedor = req.usuario.id; 

  try {
    // 1. Validações
    if (!id_cliente || !tipo || !valor_total || !taxa_juros || !data_inicio) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // 2. Verificar se o cliente pertence ao vendedor
    const clientePertenceAoVendedor = await verificarClienteVendedor(id_cliente, id_vendedor);
    if (!clientePertenceAoVendedor) {
      return res.status(403).json({ error: 'Você não tem permissão para criar um empréstimo para este cliente.' });
    }

    // 3. Inserir o novo empréstimo no banco de dados
    const sql = `INSERT INTO emprestimos (id_cliente, tipo, valor_total, taxa_juros, data_inicio, status) 
                 VALUES (?, ?, ?, ?, ?, 'ativo')`; 
    const values = [id_cliente, tipo, valor_total, taxa_juros, data_inicio];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar empréstimo:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar empréstimo.' });
      }

      console.log('Empréstimo cadastrado com sucesso!');
      return res.status(201).json({ message: 'Empréstimo cadastrado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao cadastrar empréstimo:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar empréstimo.' });
  }
});

// Função auxiliar para verificar se o cliente pertence ao vendedor
async function verificarClienteVendedor(id_cliente, id_vendedor) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT 1 FROM clientes WHERE id = ? AND id_vendedor = ?';
    db.query(sql, [id_cliente, id_vendedor], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length > 0); 
      }
    });
  });
}

module.exports = router;