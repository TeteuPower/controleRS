document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('login-form');

    if (formLogin) {
        formLogin.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede o envio padrão do formulário

            const usuario = document.getElementById('username').value;
            const senha = document.getElementById('password').value;

            // Faz a requisição POST para a API de login
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, senha })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição.'); 
                }
                return response.json();
            })
            .then(data => {
                // Login bem-sucedido!
                //console.log('Login bem-sucedido:', data);
                localStorage.setItem('token', data.token); // Salva o token no localStorage
                localStorage.setItem('vendedor_id', data.id);
                localStorage.setItem('vendedor_nome', data.nome);
                localStorage.setItem('vendedor_usuario', data.usuario);
                window.location.href = '../html/dashboard.html'; // Redireciona para a página do dashboard (a ser criada)
            })
            .catch(error => {
                console.error('Erro durante o login:', error);
                // Exibe mensagem de erro para o usuário (substitua pelo seu método preferido)
                alert('Usuário ou senha incorretos.'); 
            });
        });
    }
});