const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Importe a conexão com o banco de dados

router.post('/', async (req, res) => {
  const { nome, usuario, senha } = req.body;

  try {
    // 1. Verificar se o usuário já existe
    const usuarioExistente = await verificarUsuarioExistente(usuario);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Nome de usuário já cadastrado.' });
    }

    // 2. Hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 3. Inserir o novo vendedor no banco de dados
    const sql = 'INSERT INTO vendedores (nome, usuario, senha) VALUES (?, ?, ?)';
    const values = [nome, usuario, senhaHash];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Erro ao cadastrar vendedor:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar vendedor.' });
      }

      console.log('Vendedor cadastrado com sucesso!');
      return res.status(201).json({ message: 'Vendedor cadastrado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao cadastrar vendedor:', error);
    return res.status(500).json({ error: 'Erro ao cadastrar vendedor.' });
  }
});

// Função auxiliar para verificar se o usuário já existe
async function verificarUsuarioExistente(usuario) {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT 1 FROM vendedores WHERE usuario = ?';
    db.query(sql, [usuario], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length > 0); // Retorna true se o usuário existir
      }
    });
  });
}

module.exports = router;