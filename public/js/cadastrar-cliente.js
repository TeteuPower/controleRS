document.addEventListener('DOMContentLoaded', () => {
    const formCadastrarCliente = document.getElementById('form-cadastrar-cliente');
  
    if (formCadastrarCliente) {
      formCadastrarCliente.addEventListener('submit', (event) => {
        event.preventDefault();
  
        const nome = document.getElementById('nome').value;
        const endereco = document.getElementById('endereco').value;
        const telefone = document.getElementById('telefone').value;
        const documento = document.getElementById('documento').value;
        const informacoes = document.getElementById('informacoes').value;
        const id_vendedor = localStorage.getItem('vendedor'); 
  
        // Validações básicas do lado do cliente 
        if (!nome || !id_vendedor) {
          alert('Por favor, preencha os campos obrigatórios (Nome e ID do Vendedor).');
          return;
        }
  
        // Criar objeto com os dados do cliente
        const novoCliente = {
          nome: nome,
          endereco: endereco,
          telefone: telefone,
          documento: documento,
          informacoes: informacoes,
          id_vendedor: id_vendedor,
        };
  
        // Fazer requisição POST para a API com o token de autenticação
        fetch('/cadastrar-cliente', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'), // Adiciona o token no header
          },
          body: JSON.stringify(novoCliente), 
        })
          .then((response) => {
            if (!response.ok) {
              // Lógica para lidar com erro na requisição
              return response.json().then((err) => {
                throw new Error(err.error || 'Erro ao cadastrar cliente.'); 
              });
            }
            return response.json();
          })
          .then((data) => {
            // Cadastro bem-sucedido!
            alert(data.message || 'Cliente cadastrado com sucesso!');
            formCadastrarCliente.reset(); // Limpa o formulário
          })
          .catch((error) => {
            console.error('Erro ao cadastrar cliente:', error);
            alert(error.message || 'Erro ao cadastrar cliente. Por favor, tente novamente.');
          });
      });
    }
  });