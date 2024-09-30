// utils/verificarPagamentos.js
const db = require('../db'); // Importe a conexão com o banco de dados
const cron = require('node-cron'); // Importe a biblioteca node-cron

// Função para verificar os pagamentos
async function verificarPagamentos() {
    try {
      // 1. Obter todos os empréstimos diários ativos
      const sqlDiarios = `
        SELECT 
          id, 
          id_cliente, 
          data_inicio, 
          numero_dias, 
          valor_total, 
          taxa_juros,
          status 
        FROM 
          emprestimos_diarios 
        WHERE 
          status = 'ativo' OR status = 'aguardando' OR status = 'atrasado'
      `;
  
      const [emprestimosDiarios] = await db.promise().query(sqlDiarios);
  
      // 2. Iterar sobre cada empréstimo diário
      for (const emprestimo of emprestimosDiarios) {
        // 3. Verificar se o empréstimo está em dia ou atrasado
        const dataInicio = new Date(emprestimo.data_inicio); // Manter a data de início original
        const dataAtual = new Date();
        let diasDecorridos = 0;
  
        // Iterar sobre os dias entre a data de início e a data atual
        for (let data = new Date(dataInicio); data <= dataAtual; data.setDate(data.getDate() + 1)) {
          const diaSemana = data.getDay(); // 0 (Domingo) - 6 (Sábado)
          if (diaSemana !== 0) { // Se não for domingo
            // Verificar se a data é feriado
            const sqlFeriado = 'SELECT 1 FROM feriados WHERE data = ?';
            const [feriado] = await db.promise().query(sqlFeriado, [data.toISOString().slice(0, 10)]); // Converter data para formato YYYY-MM-DD
            if (feriado.length === 0) { // Se não for feriado
              diasDecorridos++;
            }
          }
        }
  
        const valorTotal = emprestimo.valor_total;
        const taxaJuros = emprestimo.taxa_juros;
        const diasJuros = emprestimo.numero_dias;
        const valorTotalComJuros = (valorTotal * ((taxaJuros/100) + 1));
        const parcelaDiaria = (valorTotal * ((taxaJuros/100) + 1) ) / diasJuros; // Calcula a parcela diária
        const totalDeveriaEstarPago = parcelaDiaria * diasDecorridos; // Calcula o valor do pagamento diário
  
        // 4. Consultar o valor total pago para o empréstimo
        const sqlPagamentos = `
          SELECT SUM(valor_pago) AS total_pago
          FROM pagamentos_diarios
          WHERE id_emprestimo = ?
        `;
        const [saldoEmprestimo] = await db.promise().query(sqlPagamentos, [emprestimo.id]);
        const totalEstaPago = saldoEmprestimo[0].total_pago || 0; // Obter o valor total pago
  
        const parcelas = (totalEstaPago - totalDeveriaEstarPago)/ parcelaDiaria; // Calcula o valor das parcelas restantes
  
        //console.log(dataInicio, dataAtual, diasDecorridos)
        //console.log(emprestimo);
        //console.log('Parcela:', parcelas);
  
        //// 5. Atualizar o status do empréstimo
        if(parseFloat(totalEstaPago) === parseFloat(valorTotalComJuros)) {
          // Atualizar o status para 'pago'
          const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
          await db.promise().query(sqlAtualiza, ['quitado', emprestimo.id]);
          console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'quitado'.`);
        } else {
          if (parcelas < -1) {
            // Atualizar o status para 'atrasado'
            const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
            console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'atrasado'.`);
          } else if (parcelas === -1) {
            // Atualizar o status para 'aguardando'
            const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['aguardando', emprestimo.id]);
            console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'aguardando'.`);
          } else if (parcelas >= 0) {
            // Atualizar o status para 'ativo'
            const sqlAtualiza = 'UPDATE emprestimos_diarios SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['ativo', emprestimo.id]);
            console.log(`Empréstimo diário ID:${emprestimo.id} atualizado para 'ativo'.`);
          }
        }
      }
      console.log('Verificação dos pagamentos diários concluída.');
      // 1. Obter todos os empréstimos mensais ativos
      const sqlMensais = `
        SELECT 
          id, 
          id_cliente, 
          data_inicio,  
          valor_total, 
          taxa_juros,
          status 
        FROM 
          emprestimos_mensais 
        WHERE 
          status = 'ativo' OR status = 'aguardando' OR status = 'atrasado'
      `;
  
      const [emprestimosMensais] = await db.promise().query(sqlMensais);
      // 2. Iterar sobre cada empréstimo diário
      for (const emprestimo of emprestimosMensais) {
        // 3. Verificar se o empréstimo está em dia ou atrasado
        const dataInicio = new Date(emprestimo.data_inicio); // Manter a data de início original
        const dataAtual = new Date();
        const diaDoMesAtual = dataAtual.getDate(); // Obter o dia do mês atual
        const diaDoMesInicio = dataInicio.getDate(); // Obter o dia do mês de início do empréstimo
        const mesAtual = dataAtual.getMonth() + 1; // Obter o mês atual
        const mesDoInicio = dataInicio.getMonth() + 1; // Obter o mês de início do empréstimo
  
        //console.log(diaDoMesInicio, diaDoMesAtual);
        //console.log(emprestimo)
  
        // 4. Consultar o valor total pago para o empréstimo
        const sqlPagamentos = `
          SELECT SUM(valor_pago) AS total_pago
          FROM pagamentos_mensais
          WHERE id_emprestimo = ?
        `;
        const [saldoEmprestimo] = await db.promise().query(sqlPagamentos, [emprestimo.id]);
        const totalEstaPago = parseFloat(saldoEmprestimo[0].total_pago) || 0; // Obter o valor total pago
          const valorParcela = (emprestimo.valor_total * (emprestimo.taxa_juros/100));
          const totalDeveriaEstarPago = ((mesAtual - mesDoInicio) * valorParcela); // Calcula a parcela mensal do empréstimo

//          console.log(valorParcela, totalDeveriaEstarPago, totalEstaPago);

          // 6. Verificar o status do empréstimo
          if (totalEstaPago >= totalDeveriaEstarPago) {
            // Atualizar o status para 'quitado'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['ativo', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'ativo'.`);
          } else if (totalEstaPago < totalDeveriaEstarPago && diaDoMesAtual === diaDoMesInicio) {
            // Atualizar o status para 'aguardando'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['aguardando', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'aguardando'.`);
          } else if (totalEstaPago < totalDeveriaEstarPago && diaDoMesAtual > diaDoMesInicio) {
            // Atualizar o status para 'atrasado'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'atrasado'.`);
          }
        
      }
      console.log('Verificação dos pagamentos mensais concluída.');
  
      console.log('Verificação de todos pagamentos concluída!');
    } catch (error) {
      console.error('Erro ao verificar pagamentos:', error);
    }
  }
  
  // Agendar a função para executar todos os dias às 00:01
  cron.schedule('01 03 * * *', verificarPagamentos);

module.exports = verificarPagamentos;