document.addEventListener('DOMContentLoaded', () => {
    const feriadosList = document.getElementById('feriados-list');
    const formAdicionarFeriado = document.getElementById('form-adicionar-feriado');
  
    // Função para buscar os feriados
    function buscarFeriados() {
      fetch('/feriados', {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar feriados.');
          }
          return response.json();
        })
        .then((feriados) => {
          exibirFeriados(feriados);
        })
        .catch((error) => {
          console.error('Erro ao buscar feriados:', error);
          alert('Erro ao buscar feriados');
          //exibirMensagemErro('Erro ao buscar feriados.');
        });
    }
  
    // Função para exibir os feriados
    function exibirFeriados(feriados) {
      feriadosList.innerHTML = ''; // Limpa a lista de feriados
  
      if (feriados.length === 0) {
        const mensagem = document.createElement('li');
        mensagem.textContent = 'Nenhum feriado cadastrado.';
        feriadosList.appendChild(mensagem);
        return;
      }
  
      feriados.forEach((feriado) => {
        const feriadoItem = document.createElement('li');
        feriadoItem.innerHTML = `
          <span class="data">${formatarData(feriado.data)}</span>
          <button data-id="${feriado.id}" class="remover-feriado">Remover</button>
        `;
        feriadosList.appendChild(feriadoItem);
      });
  
      // Adicionar ouvintes de evento para os botões "Remover"
      const botoesRemover = feriadosList.querySelectorAll('.remover-feriado');
      botoesRemover.forEach((botao) => {
        botao.addEventListener('click', () => {
          removerFeriado(botao.dataset.id);
        });
      });
    }
  
    // Função para remover um feriado
    function removerFeriado(idFeriado) {
      fetch(`/feriados/${idFeriado}`, {
        method: 'DELETE',
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao remover feriado.');
          }
          return response.json();
        })
        .then((data) => {
          //exibirMensagemSucesso(data.message);
          alert('Feriado removido com sucesso!');
          buscarFeriados(); // Atualiza a lista de feriados
        })
        .catch((error) => {
          console.error('Erro ao remover feriado:', error);
          alert('Erro ao remover feriado.');
          //exibirMensagemErro('Erro ao remover feriado.');
        });
    }
  
    // Função para adicionar um novo feriado
    formAdicionarFeriado.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const dataFeriado = document.getElementById('data-feriado').value;
  
      fetch('/feriados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify({ data_feriado: dataFeriado }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao adicionar feriado.');
          }
          return response.json();
        })
        .then((data) => {
          //exibirMensagemSucesso(data.message);
          alert('Feriado adicionado com sucesso!');
          formAdicionarFeriado.reset(); // Limpa o formulário
          buscarFeriados(); // Atualiza a lista de feriados
        })
        .catch((error) => {
          console.error('Erro ao adicionar feriado:', error);
          alert('Erro ao adicionar feriado.');
          //exibirMensagemErro('Erro ao adicionar feriado.');
        });
    });
  
    // Chamar a função para buscar os feriados ao carregar a página
    buscarFeriados();
  });