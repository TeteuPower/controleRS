const { db } = require('../db'); // Importe a conexão com o banco de dados

// Função para verificar os pagamentos
async function verificarStatusEmprestimo(idEmprestimo, tipo_emprestimo) {
    try {
    if (tipo_emprestimo === 'diario') {
      

      // 1. Obter todos os empréstimos diários ativos
      const sqlDiario = `
        SELECT 
          ed.id,
          ed.id_cliente, 
          ed.data_inicio, 
          ed.numero_dias, 
          ed.valor_total, 
          ed.taxa_juros,
          COALESCE(SUM(pd.valor_pago), 0) AS valor_pago, -- Calcula a soma
          ed.status,
          ed.id_vendedor
        FROM 
          emprestimos_diarios ed
        LEFT JOIN
          pagamentos_diarios pd ON ed.id = pd.id_emprestimo
        WHERE 
          ed.id = ?
        GROUP BY ed.id; -- Importante para o SUM()
      `;
  
      const [emprestimosDiarios] = await db.promise().query(sqlDiario, [idEmprestimo]);
      //console.log(emprestimosDiarios);
  
      // 2. Iterar sobre cada empréstimo diário
      for (const emprestimo of emprestimosDiarios) {
        // 3. Verificar se o empréstimo está em dia ou atrasado
        const dataInicio = new Date(emprestimo.data_inicio);
        dataInicio.setDate(dataInicio.getDate() + 1); // Começa a contar no próximo dia!
        const dataAtual = new Date();
        let diasDecorridos = 0;

        // Buscar todos os feriados do vendedor antes do loop
        const sqlTodosFeriados = 'SELECT data FROM feriados WHERE vendedor = ?';
        const [todosFeriados] = await db.promise().query(sqlTodosFeriados, [emprestimo.id_vendedor]);
        const feriados = todosFeriados.map(f => f.data.toISOString().slice(0, 10)); // Array de datas de feriados no formato 'YYYY-MM-DD'
        console.log(feriados);

        // Iterar sobre os dias entre a data de início e a data atual
        for (let data = new Date(dataInicio); data <= dataAtual; data.setDate(data.getDate() + 1)) {
          const diaSemana = data.getDay(); // 0 (Domingo) - 6 (Sábado)
          if (diaSemana !== 0) { // Se não for domingo
            // Verificar se a data é feriado
            const dataString = data.toISOString().slice(0, 10);
            if (!feriados.includes(dataString)) { // Verificação mais rápida!
              console.log('Dia de Pagamento', data.toISOString().slice(0, 10));
              diasDecorridos++;
            }
          }
        }
        console.log(diasDecorridos);
        // Iterar sobre os dias entre a data de início e a data atual
        /*for (let data = new Date(dataInicio); data <= dataAtual; data.setDate(data.getDate() + 1)) {
          const diaSemana = data.getDay(); // 0 (Domingo) - 6 (Sábado)
          if (diaSemana !== 0) { // Se não for domingo
            // Verificar se a data é feriado
            const sqlFeriado = 'SELECT 1 FROM feriados WHERE data = ?';
            const [feriado] = await db.promise().query(sqlFeriado, [data.toISOString().slice(0, 10)]); // Converter data para formato YYYY-MM-DD
            if (feriado.length === 0) { // Se não for feriado
              diasDecorridos++;
            }
          }
        }*/
  
        const valorTotal = emprestimo.valor_total;
        const taxaJuros = emprestimo.taxa_juros;
        const diasJuros = emprestimo.numero_dias;
        const valorTotalComJuros = (valorTotal * ((taxaJuros/100) + 1));
        const parcelaDiaria = (valorTotal * ((taxaJuros/100) + 1) ) / diasJuros; // Calcula a parcela diária
        const totalDeveriaEstarPago = parcelaDiaria * diasDecorridos; // Calcula o valor do pagamento diário
  
        // 4. Consultar o valor total pago para o empréstimo
        /*const sqlPagamentos = `
          SELECT SUM(valor_pago) AS total_pago
          FROM pagamentos_diarios
          WHERE id_emprestimo = ?
        `;
        const [saldoEmprestimo] = await db.promise().query(sqlPagamentos, [emprestimo.id]);*/
        const totalEstaPago = emprestimo.valor_pago; // Obter o valor total pago
  
        const parcelas = Math.round((totalEstaPago - totalDeveriaEstarPago)/ parcelaDiaria); // Calcula o valor das parcelas restantes
        console.log(parcelas);
        //console.log('totalEstaPago:', totalEstaPago,'totalDeveriaEstarPago:', totalDeveriaEstarPago, 'parcelas:', parcelas, 'valorTotalComJuros:', valorTotalComJuros);
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
          console.log(`Verificação do empréstimo diário ${emprestimo.id} concluída.`);
        }
      }
      return;
    }
    if (tipo_emprestimo === 'mensal') {
      // 1. Obter todos os empréstimos mensais ativos
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
          id = ?
      `;
  
      const [emprestimosMensais] = await db.promise().query(sqlMensais, [idEmprestimo]);
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
        /*const sqlPagamentos = `
          SELECT SUM(valor_pago) AS total_pago
          FROM pagamentos_mensais
          WHERE id_emprestimo = ?
        `;
        const [saldoEmprestimo] = await db.promise().query(sqlPagamentos, [emprestimo.id]);*/
        const totalEstaPago = parseFloat(emprestimo.valor_pago); // Obter o valor total pago
          const valorParcela = (emprestimo.valor_total * (emprestimo.taxa_juros/100));
          const totalDeveriaEstarPago = ((mesAtual - mesDoInicio) * valorParcela); // Calcula a parcela mensal do empréstimo
          //console.log('totalEstaPago:', totalEstaPago,'totalDeveriaEstarPago:', totalDeveriaEstarPago, 'diaDoMesAtual:',diaDoMesAtual,'diaDoMesInicio:', diaDoMesInicio, 'valorParcela:', valorParcela, 'mesAtual:', mesAtual, 'mesDoInicio:', mesDoInicio);

          // 6. Verificar o status do empréstimo
          if (totalEstaPago >= totalDeveriaEstarPago) {
            // Atualizar o status para 'quitado'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['ativo', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'ativo'.`);
          }
          if (totalEstaPago === (totalDeveriaEstarPago - valorParcela) && diaDoMesAtual < diaDoMesInicio) {
            // Atualizar o status para 'quitado'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['ativo', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'ativo'.`);
          }
          if (totalEstaPago < totalDeveriaEstarPago && diaDoMesAtual === diaDoMesInicio) {
            // Atualizar o status para 'aguardando'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['aguardando', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'aguardando'.`);
          }
          if (totalEstaPago < totalDeveriaEstarPago && diaDoMesAtual > diaDoMesInicio) {
            // Atualizar o status para 'atrasado'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'atrasado'.`);
          }
          if (totalEstaPago < (totalDeveriaEstarPago - valorParcela) && diaDoMesAtual < diaDoMesInicio) {
            // Atualizar o status para 'atrasado'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'atrasado'.`);
          }
          if (totalEstaPago < (totalDeveriaEstarPago - valorParcela) && diaDoMesAtual === diaDoMesInicio) {
            // Atualizar o status para 'atrasado'
            const sqlAtualiza = 'UPDATE emprestimos_mensais SET status = ? WHERE id = ?';
            await db.promise().query(sqlAtualiza, ['atrasado', emprestimo.id]);
            console.log(`Empréstimo mensal ID:${emprestimo.id} atualizado para 'atrasado'.`);
          }
          console.log(`Verificação do empréstimo mensal ${emprestimo.id} concluída.`);
      }
    }
    } catch (error) {
      console.error('Erro ao verificar pagamentos:', error);
    }

  }
  

module.exports = verificarStatusEmprestimo;