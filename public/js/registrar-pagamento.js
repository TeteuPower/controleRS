document.addEventListener('DOMContentLoaded', () => {
    const selectCliente = document.getElementById('cliente');
    const emprestimosContainer = document.getElementById('emprestimos-container');
    const modalPagamento = document.getElementById('modal-pagamento'); // Modal para registrar pagamento
    const modalParcelas = document.getElementById('modal-parcelas'); // Modal para escolher o número de parcelas
    const inputIdEmprestimo = document.getElementById('id-emprestimo');
    const inputParcelas = document.getElementById('parcelas');
    const inputValorPago = document.getElementById('valor-pago');
    const btnConfirmarPagamento = document.getElementById('btn-confirmar-pagamento');
    buscarClientes('cliente');
  
    // Função para buscar os empréstimos do cliente
    function buscarEmprestimos(idCliente) {
      fetch(`/emprestimos-cliente/${idCliente}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar empréstimos.');
          }
          return response.json();
        })
        .then((emprestimos) => {
          emprestimosContainer.innerHTML = ''; // Limpa os empréstimos anteriores
  
          if (emprestimos.length === 0) {
            emprestimosContainer.innerHTML = '<p>Nenhum empréstimo encontrado para este cliente.</p>';
            return;
          }
  
          emprestimos.forEach((emprestimo) => {
            console.log(emprestimo);
            const emprestimoItem = document.createElement('div');
            emprestimoItem.classList.add('emprestimo-item');
  
            // Determinar o status do empréstimo (você precisará implementar a lógica)
            let status = emprestimo.status; // Substitua pela lógica real para determinar o status
  
            // Adicionar a classe de status ao item do empréstimo
            emprestimoItem.classList.add(status);
  
            // Formatar as informações do empréstimo
            let infoEmprestimo = `
              <strong>ID:</strong> ${emprestimo.id}<br>
              <strong>Valor Entregue:</strong> R$ ${emprestimo.valor_total}<br>
              <strong>Taxa de Juros:</strong> ${emprestimo.taxa_juros}%<br>
              <strong>Data de Início:</strong> ${emprestimo.data_inicio}<br>
            `;
  
            // Determinar a parcela do empréstimo
            if (emprestimo.tipo === 'diario') {
                let diario = (emprestimo.valor_total * ((emprestimo.taxa_juros / 100) + 1))/emprestimo.numero_dias;
              infoEmprestimo += `<strong>Número de Dias:</strong> ${emprestimo.numero_dias}<br>`;
              infoEmprestimo += `<strong>Parcela:</strong> R$ ${diario.toFixed(2)} ${emprestimo.tipo === 'mensal' ? 'por mês' : 'por dia'}<br>`;
            }
            if(emprestimo.tipo === 'mensal') {
                let mensal = (emprestimo.valor_total * (emprestimo.taxa_juros / 100));
              infoEmprestimo += `<strong>Data de Término:</strong> ${emprestimo.data_termino || 'Indefinida'}<br>`;
              infoEmprestimo += `<strong>Parcela:</strong> R$ ${mensal.toFixed(2)} ${emprestimo.tipo === 'mensal' ? 'por mês' : 'por dia'}<br>`;
            }
  
            // Adicionar um botão para registrar o pagamento
            const botaoRegistrar = document.createElement('button');
            botaoRegistrar.textContent = 'Registrar Pagamento';
            botaoRegistrar.id = emprestimo.id; //
            botaoRegistrar.addEventListener('click', () => {
              inputIdEmprestimo.value = emprestimo.id;
              //Lógica de parcelas restantes   
              const taxaJuros = emprestimo.taxa_juros;
              const valorTotal = (emprestimo.valor_total * ((taxaJuros/100) + 1) );
              const diasJuros = emprestimo.numero_dias;
              const parcelaDiaria = valorTotal / diasJuros; // Calcula a parcela diária
              const totalPago = emprestimo.valor_pago; // Obter o valor total pago
              const parcelasRestantes = (valorTotal - totalPago)/ parcelaDiaria; // Obter o número de parcelas restantes

              //const totalDeveriaEstarPago = parcelaDiaria * diasDecorridos; // Calcula o valor do pagamento diário
              
              //const parcelas = (totalEstaPago - totalDeveriaEstarPago)/ parcelaDiaria; // Calcula o valor das parcelas restantes
              //console.log(parcelasRestantes);
              abrirModalParcelas(emprestimo.id, parcelasRestantes)
              btnConfirmarPagamento.addEventListener('click', () => {
                console.log ('aaaaaaaaaaa')
                inputValorPago.value = (inputParcelas.value * parcelaDiaria);
                modalParcelas.style.display = 'none';
                modalPagamento.style.display = 'block';
              });
            });
  
            emprestimoItem.innerHTML = infoEmprestimo;
            emprestimoItem.appendChild(botaoRegistrar);
            emprestimosContainer.appendChild(emprestimoItem);
          });
        })
        .catch((error) => {
          console.error('Erro ao buscar empréstimos:', error);
          alert('Erro ao buscar empréstimos. Por favor, tente novamente.');
        });
    }
  
    // Adicionar ouvinte de evento ao select de cliente
    selectCliente.addEventListener('change', () => {
      const idCliente = selectCliente.value;
      if (idCliente) {
        buscarEmprestimos(idCliente);
      } else {
        emprestimosContainer.innerHTML = ''; // Limpa os empréstimos se nenhum cliente for selecionado
        formPagamento.style.display = 'none'; // Oculta o formulário de pagamento
      }
    });
  
  // Manipular o envio do formulário de pagamento
  const btnRegistrarPagamento = document.getElementById('btn-registrar-pagamento'); // Obter o botão pelo ID

  btnRegistrarPagamento.addEventListener('click', (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    const id_emprestimo = inputIdEmprestimo.value;
    const valor_pagamento = inputValorPago.value;

    // Criar objeto com os dados do pagamento
    const pagamento = {
      id_emprestimo: id_emprestimo,
      valor_pagamento: valor_pagamento,
    };
    console.log(pagamento);

    // Fazer requisição POST para a API
    fetch('/registrar-pagamento/diario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'),
      },
      body: JSON.stringify(pagamento),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro na requisição.');
        }
        return response.json();
      })
      .then((data) => {
        // Pagamento registrado com sucesso!
        alert(data.message || 'Pagamento registrado com sucesso!');
        modalPagamento.style.display = 'none'; // Fecha o modal
        buscarEmprestimos(selectCliente.value); // Atualiza a lista de empréstimos
      })
      .catch((error) => {
        console.error('Erro ao registrar pagamento:', error);
        alert('Erro ao registrar pagamento. Por favor, tente novamente.');
      });



    // Adicionar ouvintes de eventos para o modal de parcelas
    modalParcelas.addEventListener('click', (event) => {
      if (event.target === modalParcelas) {
        modalParcelas.style.display = 'none';
      }
    });

    inputParcelas.addEventListener('input', calcularValorPago);
  });

    // Função para abrir o modal de escolha de parcelas
    function abrirModalParcelas(idEmprestimo, parcelasRestantes) {
      inputIdEmprestimo.value = idEmprestimo;
      inputParcelas.max = parcelasRestantes; // Define o máximo de parcelas que podem ser selecionadas
      modalParcelas.style.display = 'block';
    }
  
    // Função para calcular e exibir o valor pago
    function calcularValorPago() {
      const idEmprestimo = inputIdEmprestimo.value;
      const parcelas = parseInt(inputParcelas.value);
      const emprestimo = emprestimosContainer.querySelector(`.emprestimo-item[data-id="${idEmprestimo}"]`);
      const parcelaDiaria = parseFloat(emprestimo.querySelector('.parcela').textContent.replace('R$ ', '').replace(' por dia', ''));
  
      const valorPago = parcelaDiaria * parcelas;
      inputValorPago.value = valorPago.toFixed(2);
    }
    
      // Função para calcular e exibir o valor pago
    
});