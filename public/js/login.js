document.addEventListener('DOMContentLoaded', function() {
    //exibirLogin();
    jaEstaLogado();
    const entrarSpan = document.getElementById('entrarSpan');
    const cadastrarSpan = document.getElementById('cadastrarSpan');
  
    if (entrarSpan) {
      entrarSpan.addEventListener('click', function() {
        const checkbox = document.getElementById('reg-log');
        checkbox.checked = !checkbox.checked;
      });
    }

    if (cadastrarSpan) {
      cadastrarSpan.addEventListener('click', function() {
        const checkbox = document.getElementById('reg-log');
        checkbox.checked = !checkbox.checked;
      });
    }

    const recuperarSenha = document.getElementById('esqueceu-senha');
    recuperarSenha.addEventListener('click', function(event) {
        event.preventDefault();
        esqueceuSenha();
    });

  });

function login() {
    const usuario = document.getElementById('logemail').value;
    const senha = document.getElementById('logpass').value;

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
}

function jaEstaLogado() {
    const token = localStorage.getItem('token');
    if (token) {
        alert('Você já está logado!');
        window.location.href = '/html/dashboard.html';
    }
}

// Esqueceu senha
function esqueceuSenha() {
    const email = document.getElementById('logemail').value;
    if (!email) {
        alert('Preencha o e-mail que deseja recuperar a senha.');
        return;
    }

    fetch('/api/usuarios/redefinir-senha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao enviar e-mail de redefinição de senha.');
        }
        return response.json();
    })
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Erro ao enviar e-mail de redefinição de senha:', error);
        alert('Erro ao enviar e-mail de redefinição de senha.');
    });
}

// novo_usuario.js (frontend)

function cadastrarUsuario() {

    const nome = document.getElementById('logname').value.trim();
    const email = document.getElementById('new-logemail').value.trim();
    const senha = document.getElementById('new-logpass').value.trim();
    const confirmaSenha = document.getElementById('confirm-new-logpass').value.trim();
    const usuario = document.getElementById('new-logemail').value.trim(); //Email é o usuário por enquanto
    //const revendedor = document.getElementById('revendedor').checked; // Obtém o valor do checkbox

    if (nome === '' || email === '' || senha === '' || usuario === '' || confirmaSenha === '') {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    if (senha !== confirmaSenha) {
        alert('As senhas nao coincidem!');
        return;
    }

    //consulta se o email é válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, insira um email válido.');
        return;
    }

    fetch('/api/usuarios', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ nome, email, usuario, senha })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao cadastrar usuário.');
        }
        return response.json();
    })
    .then(data => {
        const token = data.token;
        //console.log(token);
        alert('Email de confirmação enviado. Verifique a caixa de SPAN!');
        //preencher o campo de email com o novo email
        document.getElementById('logemail').value = email;


        // Limpa o formulário
        document.getElementById('logname').value = '';
        document.getElementById('new-logemail').value = '';
        document.getElementById('new-logpass').value = '';
        document.getElementById('confirm-new-logpass').value = '';
        const checkbox = document.getElementById('reg-log');
        checkbox.checked = !checkbox.checked; // Inverte o estado atual do checkbox

        //Envia email de confirmação
        fetch('/api/mail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, token })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar email de confirmação.');
            }
            return response.json();
        })
        .then(data => {
            //console.log('Email de confirmação enviado com sucesso.');
        })
        .catch(error => {
            alert('Erro ao enviar email de confirmação.');
            console.error(error);
        });
    })
    .catch(error => {
        alert('Erro ao cadastrar usuário.');
        console.error(error);
    });
}