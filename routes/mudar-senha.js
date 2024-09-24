const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Importe a conexão com o banco de dados

router.post('/', async (req, res) => {
  const { senhaAtual, novaSenha, confirmarSenha } = req.body;
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  try {
    // 1. Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
    }

    if (novaSenha !== confirmarSenha) {
      return res.status(400).json({ error: 'As novas senhas não coincidem.' });
    }

    // 2. Buscar o vendedor no banco de dados pelo ID
    const sqlBusca = 'SELECT * FROM vendedores WHERE id = ?';
    db.query(sqlBusca, [idVendedor], async (err, result) => {
      if (err) {
        console.error('Erro ao buscar vendedor:', err);
        return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: 'Vendedor não encontrado.' });
      }

      const vendedor = result[0];

      // 3. Verificar se a senha atual está correta
      const senhaAtualValida = await bcrypt.compare(senhaAtual, vendedor.senha);
      if (!senhaAtualValida) {
        return res.status(401).json({ error: 'Senha atual incorreta.' });
      }

      // 4. Hash da nova senha
      const saltRounds = 10;
      const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

      // 5. Atualizar a senha no banco de dados
      const sqlAtualiza = 'UPDATE vendedores SET senha = ? WHERE id = ?';
      db.query(sqlAtualiza, [novaSenhaHash, idVendedor], (err, result) => {
        if (err) {
          console.error('Erro ao atualizar senha:', err);
          return res.status(500).json({ error: 'Erro ao atualizar senha.' });
        }

        console.log('Senha atualizada com sucesso!');
        return res.json({ message: 'Senha atualizada com sucesso!' });
      });
    });
  } catch (error) {
    console.error('Erro ao mudar senha:', error);
    return res.status(500).json({ error: 'Erro ao processar a solicitação.' });
  }
});

module.exports = router;