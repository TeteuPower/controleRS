document.addEventListener('DOMContentLoaded', () => {
    const formCadastrarEmprestimo = document.getElementById('form-cadastrar-emprestimo');
    const selectCliente = document.getElementById('cliente');
    const inputValor = document.getElementById('valor');
    const inputJuros = document.getElementById('juros');
    const avisoValorTotal = document.getElementById('aviso-valor-total');
  
    // Função para obter os clientes do vendedor do backend
    async function carregarClientes() {
      try {
        const response = await fetch('/obter-clientes-vendedor', {
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('token'),
          },
        });
  
        if (!response.ok) {
          throw new Error('Erro ao obter clientes.');
        }
  
        const data = await response.json();
        return data.clientes; // Retorna a lista de clientes do vendedor
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        alert('Erro ao carregar clientes. Por favor, tente novamente.');
        return [];
      }
    }
  
    // Função para calcular e exibir o valor total do empréstimo
    function calcularValorTotal(valor, juros) {
      const valorTotal = valor * (1 + juros / 100);
      avisoValorTotal.textContent = `Valor total do empréstimo: R$ ${valorTotal.toFixed(2)}`;
      avisoValorTotal.style.display = 'block';
    }
  
    // Carregar clientes ao carregar a página
    carregarClientes().then((clientes) => {
      clientes.forEach((cliente) => {
        const option = document.createElement('option');
        option.value = cliente.id;
        option.textContent = cliente.nome;
        selectCliente.appendChild(option);
      });
    });
  
    // Adicionar evento de input aos campos de valor e juros para calcular o valor total
    inputValor.addEventListener('input', () => {
      const valor = parseFloat(inputValor.value) || 0;
      const juros = parseFloat(inputJuros.value) || 0;
      calcularValorTotal(valor, juros);
    });
  
    inputJuros.addEventListener('input', () => {
      const valor = parseFloat(inputValor.value) || 0;
      const juros = parseFloat(inputJuros.value) || 0;
      calcularValorTotal(valor, juros);
    });
  
    // Manipular o envio do formulário
    if (formCadastrarEmprestimo) {
      formCadastrarEmprestimo.addEventListener('submit', async (event) => {
        event.preventDefault();
  
        const id_cliente = selectCliente.value;
        const tipo = document.getElementById('tipo').value;
        const valor_total = parseFloat(inputValor.value);
        const taxa_juros = parseFloat(inputJuros.value);
        const data_inicio = document.getElementById('data').value;
  
        // 1. Validações do lado do cliente
        if (!id_cliente || !tipo || !valor_total || !taxa_juros || !data_inicio) {
          alert('Por favor, preencha todos os campos.');
          return;
        }
  
        // 2. Criar objeto com os dados do empréstimo
        const novoEmprestimo = {
          id_cliente: parseInt(id_cliente), // Converter para número inteiro
          tipo: tipo,
          valor_total: valor_total,
          taxa_juros: taxa_juros,
          data_inicio: data_inicio,
        };
  
        // 3. Fazer requisição POST para a API
        try {
          const response = await fetch('/cadastrar-emprestimo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token'),
            },
            body: JSON.stringify(novoEmprestimo),
          });
  
          if (!response.ok) {
            const errorData = await response.json(); // Obter a resposta de erro como JSON
            throw new Error(errorData.error || 'Erro ao cadastrar empréstimo.');
          }
  
          const data = await response.json();
          alert(data.message || 'Empréstimo cadastrado com sucesso!');
          formCadastrarEmprestimo.reset();
          avisoValorTotal.style.display = 'none';
        } catch (error) {
          console.error('Erro ao cadastrar empréstimo:', error);
          alert(error.message || 'Erro ao cadastrar empréstimo. Por favor, tente novamente.');
        }
      });
    }
  });