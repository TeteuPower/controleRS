document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
  atualizarHoraServidor();
  setInterval(atualizarHoraServidor, 1000);
  const emprestimosDiariosContainer = document.getElementById('emprestimos-diarios-container');
  const emprestimosMensaisContainer = document.getElementById('emprestimos-mensais-container');
  const filtroDiarios = document.getElementById('filtro-diarios');
  const filtroMensais = document.getElementById('filtro-mensais');
  const inputIdEmprestimo = document.getElementById('id-emprestimo');
  const inputParcelas = document.getElementById('parcelas');
  const modalParcelas = document.getElementById('modal-parcelas'); // Modal para escolher o número de parcelas
  const btnConfirmarPagamento = document.getElementById('btn-confirmar-pagamento');
  const inputValorPago = document.getElementById('valor-pago');
  const modalPagamento = document.getElementById('modal-pagamento'); // Modal para registrar pagamento

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
    //console.log(emprestimos);
    //console.log(container);
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
          infoEmprestimo += `
          <p>R$ ${formatarValor(emprestimo.total_pago || 0)} de ${formatarValor(emprestimo.valor_total_com_juros)}</p>
          <strong>Data de Início:</strong> ${formatarData(emprestimo.data_inicio)}<br>
          <strong>Parcelas:</strong> ${Math.round(parseInt(emprestimo.parcelas_pagas))} de ${emprestimo.numero_dias}, R$:${parseFloat(emprestimo.valor_parcela).toFixed(2)} p/dia<br>
          <p><strong>Dias de atraso:</strong> ${emprestimo.dias_atraso === 0 ? 'Em dia!' : emprestimo.dias_atraso}</p>
          <button id="${emprestimo.id}" data-emprestimo_tipo="${emprestimo.tipo}" data-parcelas_restantes="${emprestimo.numero_dias - emprestimo.parcelas_pagas}" class="btn-registrar-pagamento">Registrar Pagamento</button>
          `;            
        }
  
        if (emprestimo.tipo === 'mensal') {
          //console.log(emprestimo)
          infoEmprestimo += `
            <p><strong>Parcela:</strong> R$ ${formatarValor(emprestimo.parcela)}</p>
            <p><strong>Dia de pagamento:</strong> ${new Date(emprestimo.data_inicio).getDate()}</p>
            <p><strong>Início:</strong> ${formatarData(emprestimo.data_inicio)}
            <p><strong>Parcelas Pagas:</strong> (Em breve)</p>
            <button id="${emprestimo.id}" data-emprestimo_tipo="${emprestimo.tipo}" class="btn-registrar-pagamento">Pagar Mensalidade</button>
            <button id="${emprestimo.id}" data-emprestimo_tipo="${emprestimo.tipo}" class="btn-registrar-pagamento">Quitar/Amortizar</button>
            `;
        }
  
        infoEmprestimo += `</div>
          <div class="status"><p>Status:</p><p> ${emprestimo.status}</p></div>
        `;
  
        emprestimoItem.innerHTML = infoEmprestimo;
        container.appendChild(emprestimoItem);
      }
    });
    container.addEventListener('click', (event) => {
      if (event.target.classList.contains('btn-registrar-pagamento')) {
        const emprestimoId = event.target.id; // Obtém o ID do botão (que é o ID do empréstimo)
        const emprestimoTipo = event.target.dataset.emprestimo_tipo;
        if (event.target.textContent === 'Pagar Mensalidade') {
          alert(`ID: ${emprestimoId}, Tipo: ${emprestimoTipo}`);
          //pagarMensalidade(emprestimoId);
        };
        if (event.target.textContent === 'Quitar/Amortizar') {
          alert(`ID: ${emprestimoId}, Tipo: ${emprestimoTipo}`);
          //quitarAmortizar(emprestimoId);
        };
        if (event.target.textContent === 'Registrar Pagamento') {
          if (emprestimoTipo === 'diario') {
            //alert(`ID: ${emprestimoId}, Tipo: ${emprestimoTipo}`);
            abrirModalParcelas(emprestimoId, emprestimoTipo)
          } else {
          alert('Erro!')
          };
        };
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


  function abrirModalParcelas(idEmprestimo, emprestimoTipo) {
    if (emprestimoTipo === 'diario') {
      // Resgata informações do empréstimo
      fetch(`/emprestimos-diarios/${idEmprestimo}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar empréstimo diário.');
        }
        return response.json();
      })
      .then((emprestimo) => {
        // Abre o modal com os dados do empréstimo
        console.log(emprestimo);
        inputIdEmprestimo.value = emprestimo.id;
        inputParcelas.max = emprestimo.numero_dias - emprestimo.parcelas_pagas; // Define o máximo de parcelas que podem ser selecionadas
        modalParcelas.style.display = 'block';
        const parcelasRestantes = emprestimo.numero_dias - emprestimo.parcelas_pagas;
        const parcelaDiaria = parseFloat(emprestimo.valor_parcela)
        btnConfirmarPagamento.addEventListener('click', () => {
          if (inputParcelas.value>parcelasRestantes) {
            alert(`Esse empréstimo tem apenas ${Math.round(parcelasRestantes)} parcelas restantes. Por favor, escolha um valor menor!`);
            return;
          } else {
            inputValorPago.value = parseFloat(inputParcelas.value * parcelaDiaria).toFixed(2);
            modalParcelas.style.display = 'none';
            modalPagamento.style.display = 'block';
            // Manipular o envio do formulário de pagamento
            const btnRegistrarPagamento = document.getElementById('btn-registrar-pagamento'); // Obter o botão pelo ID

            btnRegistrarPagamento.addEventListener('click', (event) => {
              event.preventDefault(); // Impede o envio padrão do formulário

              const id_emprestimo = inputIdEmprestimo.value;
              const valor_pagamento = inputValorPago.value;
              const tipoEmprestimo = emprestimoTipo;

              // Criar objeto com os dados do pagamento
              const pagamento = {
                id_emprestimo: id_emprestimo,
                valor_pagamento: valor_pagamento,
                tipoEmprestimo: tipoEmprestimo
              };
              //console.log(pagamento);
              if (pagamento.tipoEmprestimo === 'diario') {
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
                    // Atualiza a página como se pressionasse f5
                    window.location.reload();
                    
                    //modalPagamento.style.display = 'none'; // Fecha o modal
                    //buscarEmprestimosDiarios();
                    //buscarEmprestimos(selectCliente.value); // Atualiza a lista de empréstimos
                  })
                  .catch((error) => {
                    console.error('Erro ao registrar pagamento:', error);
                    alert('Erro ao registrar pagamento. Por favor, tente novamente.');
                  });
              }
              if (pagamento.tipoEmprestimo === 'mensal') {
                // Fazer requisição POST para a API
                fetch('/registrar-pagamento/mensal', {
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
                    //buscarEmprestimos(selectCliente.value); // Atualiza a lista de empréstimos
                  })
                  .catch((error) => {
                    console.error('Erro ao registrar pagamento:', error);
                    alert('Erro ao registrar pagamento. Por favor, tente novamente.');
                  });
              }
            });
          }
        });


        // Função para calcular e exibir o valor pago
        function calcularValorPago() {
          const idEmprestimo = inputIdEmprestimo.value;
          const parcelas = parseInt(inputParcelas.value);
          const emprestimo = emprestimosContainer.querySelector(`.emprestimo-item[data-id="${idEmprestimo}"]`);
          const parcelaDiaria = emprestimo.valor_parcela;
        
          const valorPago = parcelaDiaria * parcelas;
          inputValorPago.value = valorPago.toFixed(2);
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar empréstimo diário:', error);
        alert('Erro ao buscar empréstimo diário. Por favor, tente novamente.');
      });
    };
  }


  // Função para fechar o modal
  function fecharModal(modal) {
    modal.style.display = 'none';
  }

  // Adicionar ouvinte de evento ao botão "x"
  const botaoFecharModal = modalParcelas.querySelector('.close');
  const botaoFecharModalPagamento = modalPagamento.querySelector('.close');
  //const botaoFecharModalMensal = modalMensal.querySelector('.close');
  //const botaoFecharModalMensalQuitacao = modalMensalQuitacao.querySelector('.close');
  //const botaoFecharModalMensalAbatimento = modalMensalAbatimento.querySelector('.close');
  /*botaoFecharModalMensalAbatimento.addEventListener('click', () => {
    fecharModal(modalMensalAbatimento);
  });*/
  botaoFecharModalPagamento.addEventListener('click', () => {
    fecharModal(modalPagamento);
  });
  /*botaoFecharModalMensal.addEventListener('click', () => {
    fecharModal(modalMensal);
  });
  botaoFecharModalMensalQuitacao.addEventListener('click', () => {
    fecharModal(modalMensalQuitacao);
  });*/
  botaoFecharModalPagamento.addEventListener('click', () => {
    fecharModal(modalPagamento);
  });
  botaoFecharModal.addEventListener('click', () => {
    fecharModal(modalParcelas);
  });
});