// utils/verificarPagamentos.js
const { db } = require('../db'); // Importe a conexão com o banco de dados
const cron = require('node-cron'); // Importe a biblioteca node-cron

// Função para verificar os pagamentos
async function verificarPagamentos() {
  console.log('Iniciando verificação de todos os pagamentos do servidor...');
  const connection = await db.promise().getConnection(); //Envolvendo todas as operações de um empréstimo em uma transação. Isso garante consistência dos dados, caso ocorra algum erro durante as atualizações.

    try {
      await connection.beginTransaction(); // Iniciar a transação
      //console.log('Antes da consulta SQL diário');
      // 1. Obter todos os empréstimos diários ativos
      const sqlDiarios = `
        SELECT 
          id, 
          id_cliente, 
          data_inicio, 
          numero_dias, 
          valor_total, 
          taxa_juros,
          status,
          id_vendedor
        FROM 
          emprestimos_diarios 
        WHERE 
          status = 'ativo' OR status = 'aguardando' OR status = 'atrasado'
      `;
  
      const [emprestimosDiarios] = await db.promise().query(sqlDiarios);

      //console.log('Depois da consulta SQL diários');
  
      // 2. Iterar sobre cada empréstimo diário
      const idsQuitados = [];
      const idsAtrasados = [];
      const idsAguardando = [];
      const idsAtivo = [];
      for (const emprestimo of emprestimosDiarios) {
        // 3. Verificar se o empréstimo está em dia ou atrasado
        //console.log(emprestimo);
        const dataInicio = new Date(emprestimo.data_inicio); // Manter a data de início original
        const dataAtual = new Date();
        let diasDecorridos = 0;

        // Buscar todos os feriados do vendedor antes do loop
        const sqlTodosFeriados = 'SELECT data FROM feriados WHERE vendedor = ?';
        const [todosFeriados] = await db.promise().query(sqlTodosFeriados, [emprestimo.id_vendedor]);
        const feriados = todosFeriados.map(f => f.data.toISOString().slice(0, 10)); // Array de datas de feriados no formato 'YYYY-MM-DD'
        //console.log('Feriados', feriados);
  
        // Iterar sobre os dias entre a data de início e a data atual
        for (let data = new Date(dataInicio); data <= dataAtual; data.setDate(data.getDate() + 1)) {
          const diaSemana = data.getDay(); // 0 (Domingo) - 6 (Sábado)
          if (diaSemana !== 0) { // Se não for domingo
            // Verificar se a data é feriado
            const dataString = data.toISOString().slice(0, 10);
            if (!feriados.includes(dataString)) { // Verificação mais rápida!
              //console.log('Dia de Pagamento', data.toISOString().slice(0, 10));
              diasDecorridos++;
            }
            /*console.log('Antes da consulta sql de feriado');
            const sqlFeriado = 'SELECT data FROM feriados WHERE data = ? AND vendedor = ?';
            const [feriado] = await db.promise().query(sqlFeriado, [data.toISOString().slice(0, 10), emprestimo.id_vendedor]); // Converter data para formato YYYY-MM-DD
            console.log('Depois da consulta sql de feriado', feriado);
            if (feriado.length === 0) { // Se não for feriado
              diasDecorridos++;
            }*/
          }
        }
  
        const valorTotal = emprestimo.valor_total;
        const taxaJuros = emprestimo.taxa_juros;
        const diasJuros = emprestimo.numero_dias;
        const valorTotalComJuros = (valorTotal * ((taxaJuros/100) + 1));
        const parcelaDiaria = (valorTotal * ((taxaJuros/100) + 1) ) / diasJuros; // Calcula a parcela diária
        const totalDeveriaEstarPago = parcelaDiaria * diasDecorridos; // Calcula o valor do pagamento diário
  
        // 4. Consultar o valor total pago para o empréstimo
        //console.log('Antes da consulta sql de pagamentos');
        const sqlPagamentos = `
          SELECT SUM(valor_pago) AS total_pago
          FROM pagamentos_diarios
          WHERE id_emprestimo = ?
        `;
        const [saldoEmprestimo] = await db.promise().query(sqlPagamentos, [emprestimo.id]);
        //console.log('Depois da consulta sql de pagamentos');
        const totalEstaPago = saldoEmprestimo[0].total_pago || 0; // Obter o valor total pago
  
        const parcelas = (totalEstaPago - totalDeveriaEstarPago)/ parcelaDiaria; // Calcula o valor das parcelas restantes
  
        //console.log(dataInicio, dataAtual, diasDecorridos)
        //console.log(emprestimo);
        //console.log('Parcela:', parcelas);
  
        //// 5. Atualizar o status do empréstimo

        if(parseFloat(totalEstaPago) === parseFloat(valorTotalComJuros)) {
          // Atualizar o status para 'pago'
          idsQuitados.push(emprestimo.id);
          /*const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['quitado', emprestimo.id]);*/
          console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'quitado'.`);
        } else {
          if (parcelas < -1) {
            // Atualizar o status para 'atrasado'
            idsAtrasados.push(emprestimo.id);
            /*const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
            console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'atrasado'.`);*/
          } else if (parcelas === -1) {
            // Atualizar o status para 'aguardando'
            idsAguardando.push(emprestimo.id);
            /*const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['aguardando', emprestimo.id]);
            console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'aguardando'.`);*/
          } else if (parcelas >= 0) {
            // Atualizar o status para 'ativo'
            idsAtivo.push(emprestimo.id);
            /*const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['ativo', emprestimo.id]);
            console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'ativo'.`);*/
          }
        }
      }
      // 6. Atualizar o status do empréstimo no banco de dados
      if (idsQuitados.length > 0) {
        await connection.query('UPDATE emprestimos_diarios SET status = "quitado" WHERE id IN (?)', [idsQuitados]);
        console.log(`Empréstimos diários IDs: ${idsQuitados} atualizados para 'quitado'.`);
      }
      if (idsAtrasados.length > 0) {
          await connection.query('UPDATE emprestimos_diarios SET status = "atrasado" WHERE id IN (?)', [idsAtrasados]);
          console.log(`Empréstimos diários IDs: ${idsAtrasados} atualizados para 'atrasado'.`);
      }
      if (idsAguardando.length > 0) {
          await connection.query('UPDATE emprestimos_diarios SET status = "aguardando" WHERE id IN (?)', [idsAguardando]);
          console.log(`Empréstimos diários IDs: ${idsAguardando} atualizados para 'aguardando'.`);
      }
      if (idsAtivo.length > 0) {
          await connection.query('UPDATE emprestimos_diarios SET status = "ativo" WHERE id IN (?)', [idsAtivo]);
          console.log(`Empréstimos diários IDs: ${idsAtivo} atualizados para 'ativo'.`);
      }
      console.log('Verificação dos pagamentos diários concluída.');
      // 1. Obter todos os empréstimos mensais ativos
      //console.log('Antes consulta sql mensal')
      const sqlMensais = `
        SELECT 
          id, 
          id_cliente, 
          data_inicio,  
          valor_total, 
          taxa_juros,
          valor_pago,
          status 
        FROM 
          emprestimos_mensais 
        WHERE 
          status = 'ativo' OR status = 'aguardando' OR status = 'atrasado'
      `;
  
      const [emprestimosMensais] = await db.promise().query(sqlMensais);
      //console.log('depois consulta sql mensal')

      // 2. Iterar sobre cada empréstimo diário
      const idsMensaisAtrasados = [];
      const idsMensaisAguardando = [];
      const idsMensaisAtivo = [];
      for (const emprestimo of emprestimosMensais) {
        // 3. Verificar se o empréstimo está em dia ou atrasado
        const dataInicio = new Date(emprestimo.data_inicio); // Manter a data de início original
        const dataAtual = new Date();
        const diaDoMesAtual = dataAtual.getDate(); // Obter o dia do mês atual
        const diaDoMesInicio = dataInicio.getDate(); // Obter o dia do mês de início do empréstimo
        const mesAtual = dataAtual.getMonth() + 1; // Obter o mês atual
        const mesDoInicio = dataInicio.getMonth() + 1; // Obter o mês de início do empréstimo
        const anoAtual = dataAtual.getFullYear(); // Obter o ano atual
        const anoDoInicio = dataInicio.getFullYear(); // Obter o ano de início do empréstimo
        const diffMeses = (anoAtual - anoDoInicio) * 12 + (mesAtual - mesDoInicio);
  
        //console.log(diaDoMesInicio, diaDoMesAtual);
        //console.log(emprestimo)
  
        // 4. Consultar o valor total pago para o empréstimo
        /*const sqlPagamentos = `
          SELECT SUM(valor_pago) AS total_pago
          FROM pagamentos_mensais
          WHERE id_emprestimo = ?
        `;
        const [saldoEmprestimo] = await db.promise().query(sqlPagamentos, [emprestimo.id]);*/
        const totalEstaPago = parseFloat(emprestimo.valor_pago); // Obter o valor total pago
        const valorParcela = (emprestimo.valor_total * (emprestimo.taxa_juros/100));
        const totalDeveriaEstarPago = (diffMeses * valorParcela); // Calcula a parcela mensal do empréstimo

        //console.log(valorParcela, totalDeveriaEstarPago, totalEstaPago);

        // 6. Verificar o status do empréstimo
        if (totalEstaPago >= totalDeveriaEstarPago) {
          // Atualizar o status para 'ativo'
          idsMensaisAtivo.push(emprestimo.id);
          /*const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['ativo', emprestimo.id]);
          console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'ativo'.`);*/
        }
        if (totalEstaPago === (totalDeveriaEstarPago - valorParcela) && diaDoMesAtual < diaDoMesInicio) {
          // Atualizar o status para 'ativo'
          idsMensaisAtivo.push(emprestimo.id);
          /*const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['ativo', emprestimo.id]);
          console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'ativo'.`);*/
        }
        if (totalEstaPago < totalDeveriaEstarPago && diaDoMesAtual === diaDoMesInicio) {
          // Atualizar o status para 'aguardando'
          idsMensaisAguardando.push(emprestimo.id);
          /*const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['aguardando', emprestimo.id]);
          console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'aguardando'.`);*/
        }
        if (totalEstaPago < totalDeveriaEstarPago && diaDoMesAtual > diaDoMesInicio) {
          // Atualizar o status para 'atrasado'
          idsMensaisAtrasados.push(emprestimo.id);
          /*const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
          console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'atrasado'.`);*/
        }
        if (totalEstaPago < (totalDeveriaEstarPago - valorParcela) && diaDoMesAtual < diaDoMesInicio) {
          // Atualizar o status para 'atrasado'
          idsMensaisAtrasados.push(emprestimo.id);
          /*const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
          console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'atrasado'.`);*/
        }
        if (totalEstaPago < (totalDeveriaEstarPago - valorParcela) && diaDoMesAtual === diaDoMesInicio) {
          // Atualizar o status para 'atrasado'
          idsMensaisAtrasados.push(emprestimo.id);
          /*const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
          console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'atrasado'.`);*/
        }
      }
      // Atualizar o banco de dados
      if (idsMensaisAtivo.length > 0) {
        await connection.query('UPDATE emprestimos_mensais SET status = "ativo" WHERE id IN (?)', [idsMensaisAtivo]);
        console.log(`Empréstimos mensais IDs:${idsMensaisAtivo} atualizados para 'ativo'.`);
      }
      
      if (idsMensaisAguardando.length > 0) {
        await connection.query('UPDATE emprestimos_mensais SET status = "aguardando" WHERE id IN (?)', [idsMensaisAguardando]);
        console.log(`Empréstimos mensais IDs:${idsMensaisAguardando} atualizados para 'aguardando'.`);
      }
      
      if (idsMensaisAtrasados.length > 0) {
        await connection.query('UPDATE emprestimos_mensais SET status = "atrasado" WHERE id IN (?)', [idsMensaisAtrasados]);
        console.log(`Empréstimos mensais IDs:${idsMensaisAtrasados} atualizados para 'atrasado'.`);
      }
      console.log('Verificação dos pagamentos mensais concluída.');
  
      console.log('Todos os empréstimos do sistema foram verificados com sucesso!');
      await connection.commit();  // Finalizar a transação com sucesso
    } catch (error) {
      await connection.rollback(); // Reverter a transação em caso de erro
      console.error('Erro ao verificar os empréstimos do servidor:', error);
    } finally {
      connection.release(); // Libera a conexão
    }
}
  
// Agendar a função para executar todos os dias às 00:01
cron.schedule('01 00 * * *', verificarPagamentos);

module.exports = verificarPagamentos;