document.addEventListener('DOMContentLoaded', () => {
    const pagamentosContainer = document.getElementById('pagamentos-container');
    const paginacaoContainer = document.getElementById('paginacao-container');
    let paginaAtual = 1;
    let totalPaginas = 1;
    // Chamar a função para buscar os pagamentos ao carregar a página
    buscarPagamentos(paginaAtual);

    // Função para buscar os pagamentos
    function buscarPagamentos(pagina) {
      fetch(`/historico-pagamentos?pagina=${pagina}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar histórico de pagamentos.');
          }
          return response.json();
        })
        .then((data) => {
            console.log(data.totalPaginas)
          exibirPagamentos(data.pagamentos);
          totalPaginas = data.totalPaginas;
          criarPaginacao();
        })
        .catch((error) => {
          console.error('Erro ao buscar histórico de pagamentos:', error);
          alert('Erro ao buscar histórico de pagamentos. Por favor, tente novamente.');
        });
    }
  
    // Função para exibir os pagamentos
    function exibirPagamentos(pagamentos) {
      pagamentosContainer.innerHTML = ''; // Limpa o container
  
      if (pagamentos.length === 0) {
        pagamentosContainer.innerHTML = '<p>Nenhum pagamento encontrado.</p>';
        return;
      }
  
      pagamentos.forEach((pagamento) => {
        console.log(pagamento)
        const pagamentoItem = document.createElement('div');
        pagamentoItem.classList.add('pagamento-item');
  
        const infoPagamento = `
          <div class="info">
            <strong>ID:</strong> ${pagamento.id} | ${pagamento.tipo === 'mensal' ? 'Juros Mensal' : 'Parcela x de y (Em breve)'}<br>
            <strong>Data:</strong> ${formatarData(pagamento.data_pagamento)}<br>
            <strong>Valor Pago:</strong> R$ ${pagamento.valor_pago}<br>
            <strong>Valor do Empréstimo:</strong> R$ ${pagamento.valor_emprestimo}<br>
            <strong>Cliente:</strong> ${pagamento.nome_cliente}
          </div>
        `;
  
        pagamentoItem.innerHTML = infoPagamento;
        pagamentosContainer.appendChild(pagamentoItem);
      });
    }
  
    // Função para criar a paginação
    function criarPaginacao() {
      paginacaoContainer.innerHTML = ''; // Limpa a paginação
  
      // Cria o botão "Anterior"
      if (paginaAtual > 1) {
        const botaoAnterior = document.createElement('div');
        botaoAnterior.classList.add('pagina-item');
        botaoAnterior.textContent = 'Anterior';
        botaoAnterior.addEventListener('click', () => {
          paginaAtual--;
          buscarPagamentos(paginaAtual);
        });
        paginacaoContainer.appendChild(botaoAnterior);
      }
  
      // Cria os botões de número da página
      for (let i = 1; i <= totalPaginas; i++) {
        const botaoPagina = document.createElement('div');
        botaoPagina.classList.add('pagina-item');
        botaoPagina.textContent = i;
        if (i === paginaAtual) {
          botaoPagina.classList.add('ativo');
        }
        botaoPagina.addEventListener('click', () => {
          paginaAtual = i;
          buscarPagamentos(paginaAtual);
        });
        paginacaoContainer.appendChild(botaoPagina);
      }
  
      // Cria o botão "Próximo"
      if (paginaAtual < totalPaginas) {
        const botaoProximo = document.createElement('div');
        botaoProximo.classList.add('pagina-item');
        botaoProximo.textContent = 'Próximo';
        botaoProximo.addEventListener('click', () => {
          paginaAtual++;
          buscarPagamentos(paginaAtual);
        });
        paginacaoContainer.appendChild(botaoProximo);
      }
    }
  });