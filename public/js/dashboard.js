document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
    const emprestimosDiariosContainer = document.getElementById('emprestimos-diarios-container');
    const emprestimosMensaisContainer = document.getElementById('emprestimos-mensais-container');
    const filtroDiarios = document.getElementById('filtro-diarios');
    const filtroMensais = document.getElementById('filtro-mensais');

        // Chamar as funções para buscar os empréstimos ao carregar a página
        buscarEmprestimosDiarios();
        buscarEmprestimosMensais();
      
        // Adicionar ouvintes de eventos para os filtros
        filtroDiarios.addEventListener('change', buscarEmprestimosDiarios);
        filtroMensais.addEventListener('change', buscarEmprestimosMensais);
  
    // Função para buscar os empréstimos diários
    function buscarEmprestimosDiarios() {
      fetch('/emprestimos-diarios', {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar empréstimos diários.');
          }
          return response.json();
        })
        .then((emprestimos) => {
          exibirEmprestimos(emprestimosDiariosContainer, emprestimos);
        })
        .catch((error) => {
          console.error('Erro ao buscar empréstimos diários:', error);
          alert('Erro ao buscar empréstimos diários. Por favor, tente novamente.');
        });
    }
  
    // Função para buscar os empréstimos mensais
    function buscarEmprestimosMensais() {
      fetch('/emprestimos-mensais', {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar empréstimos mensais.');
          }
          return response.json();
        })
        .then((emprestimos) => {
          //console.log(emprestimos);
          exibirEmprestimos(emprestimosMensaisContainer, emprestimos);
        })
        .catch((error) => {
          console.error('Erro ao buscar empréstimos mensais:', error);
          alert('Erro ao buscar empréstimos mensais. Por favor, tente novamente.');
        });
    }
  
    // Função para exibir os empréstimos
    function exibirEmprestimos(container, emprestimos) {
      container.innerHTML = ''; // Limpa o container
  
      // Filtrar os empréstimos por status (se houver filtro)
      const statusFiltro = container.previousElementSibling.querySelector('select').value;
      const emprestimosFiltrados = emprestimos.filter((emprestimo) => {
        return statusFiltro === '' || emprestimo.status === statusFiltro;
      });
  
      if (emprestimosFiltrados.length === 0) {
        container.innerHTML = '<p>Nenhum empréstimo encontrado.</p>';
        return;
      }
  
      emprestimosFiltrados.forEach((emprestimo) => {
        if (emprestimo.status === 'ativo' || emprestimo.status === 'atrasado' || emprestimo.status === 'aguardando') {
          //console.log(emprestimo)
          const emprestimoItem = document.createElement('div');
          emprestimoItem.classList.add('emprestimo-item');
          emprestimoItem.classList.add(emprestimo.status);
    
          let infoEmprestimo = `
            <div class="info">
              <p><strong>ID:</strong> ${emprestimo.id} - <strong>${emprestimo.nome_cliente}</strong></p>
              <p>R$ ${formatarValor(emprestimo.valor_total)} - <strong></strong>${emprestimo.taxa_juros}% </p>
          `;
    
          if (emprestimo.tipo === 'diario') {
            //console.log(emprestimo)
            infoEmprestimo += `<p>R$ ${formatarValor(emprestimo.total_pago || 0)} de ${formatarValor(emprestimo.valor_total * ((emprestimo.taxa_juros / 100)+1))}</p>
            <p><strong>Parcelas:</strong> ${parseInt(emprestimo.total_pago / (emprestimo.valor_total * (((emprestimo.taxa_juros / 100)+1)/emprestimo.numero_dias)))} de ${emprestimo.numero_dias}</p>
            <p><strong>Parcelas Atrasadas:</strong> (Em breve)</p>`;
          } else {
            //console.log(emprestimo)
            infoEmprestimo += `<p><strong>Parcela:</strong> R$ ${emprestimo.valor_total * (emprestimo.taxa_juros / 100)} - 
              <strong>Dia:</strong> ${new Date(emprestimo.data_inicio).getDate()}</p>
              <p><strong>Início:</strong> ${formatarData(emprestimo.data_inicio)}
              <p><strong>Parcelas Pagas:</strong> (Em breve)</p> `;
          }
    
          infoEmprestimo += `</div>
            <div class="status"><p>Status:</p><p> ${emprestimo.status}</p></div>
          `;
    
          emprestimoItem.innerHTML = infoEmprestimo;
          container.appendChild(emprestimoItem);
        }
      });
    }

    // Adicionar ouvinte de evento ao botão "Atualizar Status Manualmente"
    const btnAtualizarStatus = document.getElementById('btn-atualizar-status');
    btnAtualizarStatus.addEventListener('click', () => {
      alert(' A atualização leva cerca de 30s.')
      // Fazer uma requisição para a rota que chama a função verificarPagamentos
      fetch('/api/atualizar-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'), // Adiciona o token no header
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao atualizar status.');
          }
          return response.json();
        })
        .then((data) => {
          alert('Status dos empréstimos atualizados com sucesso!');
        })
        .catch((error) => {
          console.error('Erro ao atualizar status:', error);
          alert('Erro ao atualizar status. Por favor, tente novamente.');
        });
    });
  });