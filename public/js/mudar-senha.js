document.addEventListener('DOMContentLoaded', () => {
    const formMudarSenha = document.getElementById('form-mudar-senha');
  
    if (formMudarSenha) {
      formMudarSenha.addEventListener('submit', (event) => {
        event.preventDefault();
  
        const senhaAtual = document.getElementById('senha-atual').value;
        const novaSenha = document.getElementById('nova-senha').value;
        const confirmarSenha = document.getElementById('confirmar-senha').value;
  
        // 1. Validações do lado do cliente
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
          alert('Por favor, preencha todos os campos.');
          return;
        }
  
        if (novaSenha !== confirmarSenha) {
          alert('As novas senhas não coincidem.');
          return;
        }
  
        // 2. Criar objeto com os dados da senha
        const dadosSenha = {
          senhaAtual: senhaAtual,
          novaSenha: novaSenha,
          confirmarSenha: confirmarSenha,
        };
  
        // 3. Fazer requisição POST para a API
        fetch('/mudar-senha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token'), // Adiciona o token no header
          },
          body: JSON.stringify(dadosSenha),
        })
          .then((response) => {
            if (!response.ok) {
              // Lógica para lidar com erro na requisição
              return response.json().then((err) => {
                throw new Error(err.error || 'Erro ao mudar a senha.');
              });
            }
            return response.json();
          })
          .then((data) => {
            // Senha alterada com sucesso!
            alert(data.message || 'Senha alterada com sucesso!');
            formMudarSenha.reset(); // Limpa o formulário
          })
          .catch((error) => {
            console.error('Erro ao mudar senha:', error);
            alert(error.message || 'Erro ao mudar a senha. Por favor, tente novamente.');
          });
      });
    }
  });