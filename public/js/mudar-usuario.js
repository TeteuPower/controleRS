document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
    const formMudarUsuario = document.getElementById('form-mudar-usuario');
    const inputUsuarioAtual = document.getElementById('usuario-atual'); 
  
    // Obter o nome de usuário atual (você precisará implementar a lógica para isso)
    const usuarioAtual = localStorage.getItem('vendedor_usuario'); 
  
    // Preencher o campo "Usuário Atual"
    if (inputUsuarioAtual) {
      inputUsuarioAtual.value = usuarioAtual;
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
            // Atualizar o nome de usuário no frontend, se necessário
            if (inputUsuarioAtual) {
              inputUsuarioAtual.value = novoUsuario;
              localStorage.setItem('vendedor_usuario', novoUsuario);
            }
          })
          .catch((error) => {
            console.error('Erro ao mudar nome de usuário:', error);
            alert(error.message || 'Erro ao mudar o nome de usuário. Por favor, tente novamente.');
          });
      });
    }
  });