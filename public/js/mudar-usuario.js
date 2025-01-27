document.addEventListener('DOMContentLoaded', async () => {
  verificarAutenticacao();
    const formMudarUsuario = document.getElementById('form-mudar-usuario');
    const inputUsuarioAtual = document.getElementById('usuario-atual'); 
  
    // Consulta na tabela de vendedores para obter usuario atual do vendedor usando token jwt
    const response = await fetch('/mudar-usuario', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token'), // Adiciona o token no header
      },
    })
    const usuarioAtual = await response.json();
    if (!usuarioAtual) {
      throw new Error('Não foi possível recuperar o nome do usuário atual.');
    }

  
    // Preencher o campo "Usuário Atual"
    if (inputUsuarioAtual) {
      inputUsuarioAtual.value = usuarioAtual.email;
    }
  
    if (formMudarUsuario) {
      formMudarUsuario.addEventListener('submit', (event) => {
        event.preventDefault();
  
        const novoUsuario = document.getElementById('novo-usuario').value;
  
        // 1. Validações do lado do cliente
        if (!novoUsuario) {
          alert('Por favor, informe o novo nome de usuário.');
          return;
        }
  
        // 2. Criar objeto com o novo nome de usuário
        const dadosUsuario = {
          novoUsuario: novoUsuario,
        };
  
        // 3. Fazer requisição POST para a API
        fetch('/mudar-usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'), // Adiciona o token no header
          },
          body: JSON.stringify(dadosUsuario),
        })
          .then((response) => {
            if (!response.ok) {
              // Lógica para lidar com erro na requisição
              return response.json().then((err) => {
                throw new Error(err.error || 'Erro ao mudar o nome de usuário.');
              });
            }
            return response.json();
          })
          .then((data) => {
            // Nome de usuário alterado com sucesso!
            alert(data.message || 'Nome de usuário alterado com sucesso!');
            // Atualizar o nome de usuário no frontend
            inputUsuarioAtual.value = novoUsuario;
          })
          .catch((error) => {
            console.error('Erro ao mudar nome de usuário:', error);
            alert(error.message || 'Erro ao mudar o nome de usuário. Por favor, tente novamente.');
          });
      });
    }
  });