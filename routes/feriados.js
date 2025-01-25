const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/', autenticar, async (req, res) => {
  try {
    const sql = 'SELECT id, data FROM feriados ORDER BY data';
    const [feriados] = await db.promise().query(sql);

    return res.json(feriados);
  } catch (error) {
    console.error('Erro ao buscar feriados:', error);
    return res.status(500).json({ error: 'Erro ao buscar feriados.' });
  }
});

router.post('/', autenticar, async (req, res) => {
    const { data_feriado } = req.body;
  
    try {
      // 1. Validações (adicione mais validações conforme necessário)
      if (!data_feriado) {
        return res.status(400).json({ error: 'A data do feriado é obrigatória.' });
      }
  
      // 2. Inserir o novo feriado no banco de dados
      const sql = 'INSERT INTO feriados (data) VALUES (?)';
      const [result] = await db.promise().query(sql, [data_feriado]);
  
      return res.status(201).json({ message: 'Feriado adicionado com sucesso.' });
    } catch (error) {
      console.error('Erro ao adicionar feriado:', error);
      return res.status(500).json({ error: 'Erro ao adicionar feriado.' });
    }
});

router.delete('/:idFeriado', autenticar, async (req, res) => {
    const idFeriado = req.params.idFeriado;
    try {
      // 1. Remover o feriado do banco de dados
      const sql = 'DELETE FROM feriados WHERE id = ?';
      const [result] = await db.promise().query(sql, [idFeriado]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Feriado não encontrado.' });
      }
  
      return res.json({ message: 'Feriado removido com sucesso.' });
    } catch (error) {
      console.error('Erro ao remover feriado:', error);
      return res.status(500).json({ error: 'Erro ao remover feriado.' });
    }
});

module.exports = router;