const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação
const { db } = require('../db'); // Importe a conexão com o banco de dados

router.post('/', autenticar, async (req, res) => {
  const { novoUsuario } = req.body;
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  try {
    // 1. Validações
    if (!novoUsuario) {
      return res.status(400).json({ error: 'Por favor, informe o novo nome de usuário.' });
    }

    // 2. Verificar se o novo nome de usuário já está em uso
    const usuarioExistente = await verificarUsuarioExistente(novoUsuario);
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Nome de usuário já cadastrado.' });
    }

    // 3. Atualizar o nome de usuário no banco de dados
    const sql = 'UPDATE vendedores SET usuario = ? WHERE id = ?';
    db.query(sql, [novoUsuario, idVendedor], (err, result) => {
      if (err) {
        console.error('Erro ao atualizar nome de usuário:', err);
        return res.status(500).json({ error: 'Erro ao atualizar nome de usuário.' });
      }

      console.log('Nome de usuário atualizado com sucesso!');
      return res.json({ message: 'Nome de usuário atualizado com sucesso!' });
    });
  } catch (error) {
    console.error('Erro ao mudar nome de usuário:', error);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

// Retorna email atual pelo id de usuário do token
router.get('/', autenticar, async (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  const sql = 'SELECT usuario FROM vendedores WHERE id = ?';
  db.query(sql, [idVendedor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar email:', err);
      return res.status(500).json({ error: 'Erro ao buscar email.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Vendedor não encontrado.' });
    }

    const email = results[0].usuario;
    return res.json({ email });
  });
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