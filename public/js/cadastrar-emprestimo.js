document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
  const formCadastrarEmprestimo = document.getElementById('form-cadastrar-emprestimo');
  const selectCliente = document.getElementById('cliente');
  const selectTipoEmprestimo = document.getElementById('tipo-emprestimo');
  const campoDias = document.getElementById('campo-dias');
  const parcelaInfo = document.getElementById('parcela-info');
  buscarClientes('cliente');
    // Adicionar ouvintes de eventos
    selectTipoEmprestimo.addEventListener('change', mostrarCampoDias);
    formCadastrarEmprestimo.addEventListener('input', calcularParcela); // Calcula a parcela ao alterar os valores

  // Função para mostrar/ocultar o campo "Número de Dias"
  function mostrarCampoDias() {
    if (selectTipoEmprestimo.value === 'diario') {
      campoDias.style.display = 'block';
    } else {
      campoDias.style.display = 'none';
    }
  }

  // Função para calcular e exibir as informações da parcela
  function calcularParcela() {
    const valor = parseFloat(document.getElementById('valor').value);
    const juros = parseFloat(document.getElementById('juros').value) / 100;
    const tipoEmprestimo = selectTipoEmprestimo.value;
    const dias = parseInt(document.getElementById('dias').value);

    let parcela = 0;
    let mensagem = '';

    if (tipoEmprestimo === 'mensal') {
      parcela = valor * juros;
      mensagem = `Parcela mensal: R$ ${parcela.toFixed(2)}`;
    } else if (tipoEmprestimo === 'diario') {
      parcela = (valor * (juros + 1) ) / dias; // Calcula a parcela diária
      mensagem = `Parcela diária: R$ ${parcela.toFixed(2)}`;
    }

    if (parcela > 0) {
      parcelaInfo.innerHTML = `<p>${mensagem}</p>`;
      parcelaInfo.style.display = 'block';
    } else {
      parcelaInfo.style.display = 'none';
    }
  }


  // Manipular o envio do formulário
  formCadastrarEmprestimo.addEventListener('submit', (event) => {
    event.preventDefault();

    // Obter os dados do formulário
    const id_cliente = selectCliente.value;
    const valor = document.getElementById('valor').value;
    const juros = document.getElementById('juros').value;
    const data_inicio = document.getElementById('data-inicio').value;
    const tipo_emprestimo = selectTipoEmprestimo.value;
    const dias = document.getElementById('dias').value;

    // Criar objeto com os dados do empréstimo
    const novoEmprestimo = {
      id_cliente: id_cliente,
      valor: valor,
      juros: juros,
      data_inicio: data_inicio,
      tipo_emprestimo: tipo_emprestimo,
      dias: dias, // Inclui o número de dias, mesmo que seja vazio para empréstimos mensais
    };
    console.log(novoEmprestimo);
    // Fazer requisição POST para a API
    fetch('/cadastrar-emprestimo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'), // Adiciona o token no header
      },
      body: JSON.stringify(novoEmprestimo),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro na requisição.');
        }
        return response.json();
      })
      .then((data) => {
        // Empréstimo cadastrado com sucesso!
        alert(data.message || 'Empréstimo cadastrado com sucesso!');
        formCadastrarEmprestimo.reset(); // Limpa o formulário
        parcelaInfo.style.display = 'none'; // Oculta a caixa de informações da parcela
        campoDias.style.display = 'none'; // Oculta o campo "Número de Dias"
      })
      .catch((error) => {
        console.error('Erro ao cadastrar empréstimo:', error);
        alert('Erro ao cadastrar empréstimo. Por favor, tente novamente.');
      });
  });
});