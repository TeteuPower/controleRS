function cadastrarUsuario() {
    const nome = document.getElementById('logname').value;
    const usuario = document.getElementById('new-logemail').value;
    const senha = document.getElementById('new-logpass').value;
    const confirmaSenha = document.getElementById('confirm-new-logpass').value;

    // Validação básica do lado do cliente (opcional, mas recomendado)
    if (!nome || !usuario || !senha) {
    alert('Por favor, preencha todos os campos!');
    return;
    }

    if (senha!== confirmaSenha) {
    alert('As senhas nao coincidem!');
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
        alert(data.message || 'Conta de vendedor cadastrada com sucesso!');
        document.getElementById('logemail').value = usuario;
        // Limpa o formulário
        document.getElementById('logname').value = '';
        document.getElementById('new-logemail').value = '';
        document.getElementById('new-logpass').value = '';
        document.getElementById('confirm-new-logpass').value = '';
        const checkbox = document.getElementById('reg-log');
        checkbox.checked = !checkbox.checked; // Inverte o estado atual do checkbox
    })
    .catch((error) => {
        console.error('Erro ao cadastrar vendedor:', error);
        alert(error.message || 'Erro ao cadastrar vendedor. Por favor, tente novamente.');
    });
}