document.addEventListener('DOMContentLoaded', () => {
    const formCadastrarVendedor = document.getElementById('form-cadastrar-vendedor');
  
    if (formCadastrarVendedor) {
      formCadastrarVendedor.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário
  
        const nome = document.getElementById('nome').value;
        const usuario = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
  
        // Validação básica do lado do cliente (opcional, mas recomendado)
        if (!nome || !usuario || !senha) {
          alert('Por favor, preencha todos os campos!');
          return;
        }
  
        // Criar objeto com os dados do vendedor
        const novoVendedor = {
          nome: nome,
          usuario: usuario,
          senha: senha,
        };
  
        // Fazer requisição POST para a API
        fetch('/cadastrar-vendedor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'),
          },
          body: JSON.stringify(novoVendedor),
        })
          .then((response) => {
            if (!response.ok) {
              // Lança um erro para ser tratado no bloco catch
              return response.json().then((err) => { 
                throw new Error(err.error || 'Erro ao cadastrar vendedor.');
              });
            }
            return response.json();
          })
          .then((data) => {
            // Cadastro bem-sucedido!
            alert(data.message || 'Vendedor cadastrado com sucesso!');
            formCadastrarVendedor.reset(); // Limpa o formulário
          })
          .catch((error) => {
            console.error('Erro ao cadastrar vendedor:', error);
            alert(error.message || 'Erro ao cadastrar vendedor. Por favor, tente novamente.');
          });
      });
    }
  });