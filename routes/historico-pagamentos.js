const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/', autenticar, async (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT
  const pagina = parseInt(req.query.pagina) || 1; // Obtém o número da página da query
  const limite = 10; // Define o limite de pagamentos por página

  try {
    // 1. Buscar pagamentos mensais
    const sqlMensais = `
      SELECT 
        pm.id, 
        pm.data_pagamento, 
        pm.valor_pago, 
        em.valor_total AS valor_emprestimo, 
        c.nome AS nome_cliente
      FROM 
        pagamentos_mensais pm
      JOIN 
        emprestimos_mensais em ON pm.id_emprestimo = em.id
      JOIN 
        clientes c ON em.id_cliente = c.id
      WHERE 
        em.id_vendedor = ?
      ORDER BY 
        pm.data_pagamento DESC
      LIMIT 
        ?, ?
    `;
    const [pagamentosMensais] = await db.promise().query(sqlMensais, [idVendedor, (pagina - 1) * limite, limite]);

    // 2. Buscar pagamentos diários
    const sqlDiarios = `
      SELECT 
        pd.id, 
        pd.data_pagamento, 
        pd.valor_pago, 
        ed.valor_total AS valor_emprestimo, 
        c.nome AS nome_cliente
      FROM 
        pagamentos_diarios pd
      JOIN 
        emprestimos_diarios ed ON pd.id_emprestimo = ed.id
      JOIN 
        clientes c ON ed.id_cliente = c.id
      WHERE 
        ed.id_vendedor = ?
      ORDER BY 
        pd.data_pagamento DESC
      LIMIT 
        ?, ?
    `;
    const [pagamentosDiarios] = await db.promise().query(sqlDiarios, [idVendedor, (pagina - 1) * limite, limite]);

    // 3. Combinar os resultados
    const pagamentos = [...pagamentosMensais, ...pagamentosDiarios];
    pagamentos.sort((a, b) => new Date(b.data_pagamento) - new Date(a.data_pagamento)); // Ordenar por data (mais recentes primeiro)

    // 4. Calcular o total de páginas
    const totalPagamentos = pagamentos.length;
    const totalPaginas = Math.ceil(totalPagamentos / limite);

    return res.json({
      pagamentos,
      totalPaginas,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    return res.status(500).json({ error: 'Erro ao buscar histórico de pagamentos.' });
  }
});

module.exports = router;