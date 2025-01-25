const express = require('express');
const router = express.Router();
const { db } = require('../db'); // Importe a conexão com o banco de dados
const autenticar = require('../middleware/auth'); // Importe o middleware de autenticação

router.get('/', autenticar, async (req, res) => {
  const idVendedor = req.usuario.id; // Obtém o ID do vendedor do token JWT

  try {
    // 1. Empréstimos Ativos
    const sqlEmprestimosAtivosMensais = `
      SELECT COUNT(*) AS total_ativos
      FROM (
        SELECT id FROM emprestimos_mensais WHERE id_vendedor = ? AND status != 'quitado'
      ) AS ativos;
    `;
    const [emprestimosAtivosMensais] = await db.promise().query(sqlEmprestimosAtivosMensais, [idVendedor, idVendedor]);

        // 1. Empréstimos Ativos
        const sqlEmprestimosAtivosDiarios = `
        SELECT COUNT(*) AS total_ativos
        FROM (
          SELECT id FROM emprestimos_diarios WHERE id_vendedor = ? AND status != 'quitado'
        ) AS ativos;
      `;
      const [emprestimosAtivosDiarios] = await db.promise().query(sqlEmprestimosAtivosDiarios, [idVendedor, idVendedor]);

    // 2. Valor Total Investido
    const sqlValorTotalInvestido = `
      SELECT SUM(valor_total) AS total_investido
      FROM (
        SELECT valor_total FROM emprestimos_mensais WHERE id_vendedor = ? AND status != 'quitado'
        UNION ALL
        SELECT valor_total FROM emprestimos_diarios WHERE id_vendedor = ? AND status != 'quitado'
      ) AS investido;
    `;
    const [valorTotalInvestido] = await db.promise().query(sqlValorTotalInvestido, [idVendedor, idVendedor]);

    // 3. Lucro Diário
    const sqlLucroDiario = `
      SELECT SUM(valor_total * (taxa_juros / 100)) AS lucro_diario
      FROM emprestimos_diarios
      WHERE id_vendedor = ? AND status != 'quitado';
    `;
    const [lucroDiario] = await db.promise().query(sqlLucroDiario, [idVendedor]);

    // 4. Lucro Mensal
    const sqlLucroMensal = `
      SELECT SUM(valor_total * (taxa_juros / 100)) AS lucro_mensal
      FROM emprestimos_mensais
      WHERE id_vendedor = ? AND status != 'quitado';
    `;
    const [lucroMensal] = await db.promise().query(sqlLucroMensal, [idVendedor]);

    // 5. Empréstimos Diários Atrasados
    const sqlEmprestimosDiariosAtrasados = `
      SELECT COUNT(*) AS total_atrasados
      FROM emprestimos_diarios
      WHERE id_vendedor = ? AND status = 'atrasado';
    `;
    const [emprestimosDiariosAtrasados] = await db.promise().query(sqlEmprestimosDiariosAtrasados, [idVendedor]);

    // 6. Empréstimos Mensais Atrasados
    const sqlEmprestimosMensaisAtrasados = `
      SELECT COUNT(*) AS total_atrasados
      FROM emprestimos_mensais
      WHERE id_vendedor = ? AND status = 'atrasado';
    `;
    const [emprestimosMensaisAtrasados] = await db.promise().query(sqlEmprestimosMensaisAtrasados, [idVendedor]);

    // 7. Empréstimos Mensais Finalizados
    const sqlEmprestimosMensaisFinalizados = `
      SELECT COUNT(*) AS total_finalizados
      FROM emprestimos_mensais
      WHERE id_vendedor = ? AND status = 'quitado';
    `;
    const [emprestimosMensaisFinalizados] = await db.promise().query(sqlEmprestimosMensaisFinalizados, [idVendedor]);

    // 8. Empréstimos Diários Finalizados
    const sqlEmprestimosDiariosFinalizados = `
      SELECT COUNT(*) AS total_finalizados
      FROM emprestimos_diarios
      WHERE id_vendedor = ? AND status = 'quitado';
    `;
    const [emprestimosDiariosFinalizados] = await db.promise().query(sqlEmprestimosDiariosFinalizados, [idVendedor]);

    // 9. Lucro Total Diário
    const sqlLucroTotalDiarioQuitado = `
      SELECT SUM(valor_total * ((taxa_juros / 100)+1)) AS lucro_total_diario_quitado
      FROM emprestimos_diarios
      WHERE id_vendedor = ? AND status = 'quitado';
    `;
    const [lucroTotalDiarioQuitado] = await db.promise().query(sqlLucroTotalDiarioQuitado, [idVendedor]);

    // 10. Lucro Total Mensal
    const sqlLucroTotalMensalQuitado = `
      SELECT SUM(valor_total * ((taxa_juros / 100)+1)) AS lucro_total_mensal_quitado
      FROM emprestimos_mensais
      WHERE id_vendedor = ? AND status = 'quitado';
    `;
    const [lucroTotalMensalQuitado] = await db.promise().query(sqlLucroTotalMensalQuitado, [idVendedor]);

    // Formatar os valores para exibição
    const resumo = {
      emprestimosAtivosMensais: emprestimosAtivosMensais[0].total_ativos,
      emprestimosAtivosDiarios: emprestimosAtivosDiarios[0].total_ativos,
      valorTotalInvestido: valorTotalInvestido[0].total_investido,
      lucroDiario: lucroDiario[0].lucro_diario,
      lucroMensal: lucroMensal[0].lucro_mensal,
      emprestimosDiariosAtrasados: emprestimosDiariosAtrasados[0].total_atrasados,
      emprestimosMensaisAtrasados: emprestimosMensaisAtrasados[0].total_atrasados,
      emprestimosMensaisFinalizados: emprestimosMensaisFinalizados[0].total_finalizados,
      emprestimosDiariosFinalizados: emprestimosDiariosFinalizados[0].total_finalizados,
      lucroTotalDiarioQuitado: lucroTotalDiarioQuitado[0].lucro_total_diario_quitado,
      lucroTotalMensalQuitado: lucroTotalMensalQuitado[0].lucro_total_mensal_quitado,
    };

    return res.json(resumo);
  } catch (error) {
    console.error('Erro ao buscar resumo do vendedor:', error);
    return res.status(500).json({ error: 'Erro ao buscar resumo do vendedor.' });
  }
});

module.exports = router;