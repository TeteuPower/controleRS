document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
    const idCliente = window.location.pathname.split('/').pop(); // Obter ID do cliente da URL
    const nomeCliente = document.getElementById('nome-cliente');
    const nome = document.getElementById('nome');
    const endereco = document.getElementById('endereco');
    const telefone = document.getElementById('telefone');
    const documento = document.getElementById('documento');
    const emprestimosDiariosContainer = document.getElementById('emprestimos-diarios-container');
    const emprestimosMensaisContainer = document.getElementById('emprestimos-mensais-container');
    const filtroCliente = document.getElementById('filtro-cliente');
    const btnAlterarDados = document.getElementById('btn-alterar-dados');
    const modalAlterarDados = document.getElementById('modal-alterar-dados');
    const formAlterarDados = document.getElementById('form-alterar-dados');
    const nomeAlterar = document.getElementById('nome-alterar');
    const enderecoAlterar = document.getElementById('endereco-alterar');
    const telefoneAlterar = document.getElementById('telefone-alterar');
    const documentoAlterar = document.getElementById('documento-alterar');
  
    // Função para buscar as informações do cliente
    function buscarCliente() {
      fetch(`/clientes/${idCliente}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar informações do cliente.');
          }
          return response.json();
        })
        .then((cliente) => {
          nomeCliente.textContent = cliente.nome;
          nome.textContent = cliente.nome;
          endereco.textContent = cliente.endereco;
          telefone.textContent = cliente.telefone;
          documento.textContent = cliente.documento;
        })
        .catch((error) => {
          console.error('Erro ao buscar informações do cliente:', error);
          alert('Erro ao buscar informações do cliente. Por favor, tente novamente.');
        });
    }
  
    // Função para buscar os empréstimos do cliente
    function buscarEmprestimos(status) {
      fetch(`/clientes/${idCliente}/emprestimos?status=${status}`, {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar empréstimos do cliente.');
          }
          return response.json();
        })
        .then((emprestimos) => {
          exibirEmprestimos(emprestimosDiariosContainer, emprestimos.diarios, 'diarios');
          exibirEmprestimos(emprestimosMensaisContainer, emprestimos.mensais, 'mensais');
        })
        .catch((error) => {
          console.error('Erro ao buscar empréstimos do cliente:', error);
          alert('Erro ao buscar empréstimos do cliente. Por favor, tente novamente.');
        });
    }
  
    // Função para exibir os empréstimos
    function exibirEmprestimos(container, emprestimos, tipo) {
      container.innerHTML = ''; // Limpa o container
  
      if (emprestimos.length === 0) {
        container.innerHTML = '<p>Nenhum empréstimo encontrado.</p>';
        return;
      }
  
      emprestimos.forEach((emprestimo) => {
        const emprestimoItem = document.createElement('div');
        emprestimoItem.classList.add('emprestimo-item');
        emprestimoItem.classList.add(emprestimo.status);
  
        let infoEmprestimo = `
          <div class="info">
            <strong>ID:</strong> ${emprestimo.id} - 
            <strong>(${emprestimo.nome_cliente})</strong> - 
            <strong>Valor emprestado:</strong> R$ ${formatarValor(emprestimo.valor_total)} - 
            <strong>Taxa:</strong> ${emprestimo.taxa_juros}% 
        `;
  
        if (tipo === 'diarios') {
          infoEmprestimo += ` - <strong>Parcelas:</strong> ${emprestimo.valor_pago.toFixed(2)} / ${emprestimo.valor_total.toFixed(2)} - `;
        } else {
          infoEmprestimo += ` - <strong>Valor da Parcela:</strong> R$ ${emprestimo.valor_total.toFixed(2)} - 
            <strong>Dia do pagamento:</strong> ${new Date(emprestimo.data_inicio).getDate()} - `;
        }
  
        infoEmprestimo += `</div>
          <div class="status">Status: ${emprestimo.status}</div>
        `;
  
        emprestimoItem.innerHTML = infoEmprestimo;
        container.appendChild(emprestimoItem);
      });
    }
  
    // Função para mostrar o modal de alteração de dados
    function mostrarModalAlterarDados() {
      modalAlterarDados.style.display = 'block';
      // Preencher o formulário com os dados do cliente
      nomeAlterar.value = nome.textContent;
      enderecoAlterar.value = endereco.textContent;
      telefoneAlterar.value = telefone.textContent;
      documentoAlterar.value = documento.textContent;
    }
  
    // Função para fechar o modal
    function fecharModal(modalId) {
      document.getElementById(modalId).style.display = 'none';
    }
  
    // Função para enviar os dados alterados
    function enviarAlteracaoDados(event) {
      event.preventDefault();
  
      const dadosCliente = {
        nome: nomeAlterar.value,
        endereco: enderecoAlterar.value,
        telefone: telefoneAlterar.value,
        documento: documentoAlterar.value,
      };
  
      fetch(`/clientes/${idCliente}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token'),
        },
        body: JSON.stringify(dadosCliente),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao atualizar informações do cliente.');
          }
          return response.json();
        })
        .then((cliente) => {
          // Atualizar os dados na página
          nome.textContent = cliente.nome;
          endereco.textContent = cliente.endereco;
          telefone.textContent = cliente.telefone;
          documento.textContent = cliente.documento;
          fecharModal('modal-alterar-dados');
        })
        .catch((error) => {
          console.error('Erro ao atualizar informações do cliente:', error);
          alert('Erro ao atualizar informações do cliente. Por favor, tente novamente.');
        });
    }
  
    // Chamar as funções ao carregar a página
    buscarCliente();
    buscarEmprestimos(''); // Buscar todos os empréstimos inicialmente
  
    // Adicionar ouvintes de eventos
    filtroCliente.addEventListener('change', (event) => {
      buscarEmprestimos(event.target.value);
    });
    btnAlterarDados.addEventListener('click', mostrarModalAlterarDados);
    formAlterarDados.addEventListener('submit', enviarAlteracaoDados);
    const botaoFecharModal = modalAlterarDados.querySelector('.close');
    botaoFecharModal.addEventListener('click', () => {
      fecharModal('modal-alterar-dados');
    });
  });