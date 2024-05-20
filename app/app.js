// Transição de páginas
const links = document.querySelectorAll('nav a');

links.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        const pageContainer = document.getElementById('page-container');
        pageContainer.style.transform = 'scale(0)'; // Diminui o zoom

        // Adiciona um evento para quando a transição de saída terminar
        pageContainer.addEventListener('transitionend', () => {
            window.location.href = link.href; // Navega para a nova página
        }, { once: true });
    });
});

// Adiciona um evento para quando a nova página terminar de carregar
window.addEventListener('pageshow', (event) => {
    if (event.persisted) return; // Ignora se a página foi carregada do cache

    const newPageContainer = document.getElementById('page-container');
    newPageContainer.classList.add('page-entering');

    // Remove a classe e aplica a animação de entrada após a transição
    newPageContainer.addEventListener('transitionend', () => {
        newPageContainer.classList.remove('page-entering');
        newPageContainer.style.transform = 'scale(1)';
        newPageContainer.style.opacity = 1;

        // Torna o body visível após a animação de entrada
        document.body.style.visibility = 'visible';
    }, { once: true });
});

// Lógica para mostrar/esconder os formulários e preencher o nome do cliente
const listaClientes = document.getElementById('listaClientes');
const opcoesCliente = document.getElementById('opcoesCliente');
const clienteInput = document.getElementById('cliente'); // Input de pesquisa

listaClientes.addEventListener('click', (event) => {
    const clienteId = event.target.dataset.clienteId;
    const nomeCliente = event.target.textContent;

    // Exibe as opções do cliente APENAS se um item da lista for clicado
    if (event.target.tagName === 'LI') { 
        opcoesCliente.style.display = 'block';
        document.querySelectorAll('#formPagamento h3, #formEmprestimo h3').forEach(h3 => {
            h3.textContent = `${h3.textContent} - ${nomeCliente}`;
        });
        clienteInput.value = nomeCliente;
    }
});

// Adiciona um evento de input ao campo de pesquisa
clienteInput.addEventListener('input', () => {
    const termoPesquisa = clienteInput.value.toLowerCase();
    const itensLista = listaClientes.querySelectorAll('li');

    itensLista.forEach(item => {
        const nomeCliente = item.textContent.toLowerCase();
        item.style.display = nomeCliente.includes(termoPesquisa) ? 'block' : 'none';
    });
});

// Adiciona um evento de clique ao botão "Limpar"
document.getElementById('btnLimparPesquisa').addEventListener('click', () => {
    clienteInput.value = ''; // Limpa o input de pesquisa

    // Exibe todos os itens da lista
    const itensLista = listaClientes.querySelectorAll('li');
    itensLista.forEach(item => {
        item.style.display = 'block'; 
    });

    // Esconde as opções do cliente
    opcoesCliente.style.display = 'none';

    document.querySelectorAll('#formPagamento h3, #formEmprestimo h3').forEach(h3 => {
        h3.textContent = h3.textContent.split(' - ')[0]; // Remove o nome do cliente dos títulos
    });
    // Limpa o nome do cliente selecionado
    nomeClienteSelecionado.textContent = '';
});

// Lógica para mostrar/esconder os formulários e preencher o nome do cliente
const nomeClienteSelecionado = document.getElementById('nomeClienteSelecionado'); // Elemento para exibir o nome

listaClientes.addEventListener('click', (event) => {
    const clienteId = event.target.dataset.clienteId;
    const nomeCliente = event.target.textContent;

    // Exibe as opções do cliente APENAS se um item da lista for clicado
    if (event.target.tagName === 'LI') {
        opcoesCliente.style.display = 'block';
        document.querySelectorAll('#formPagamento h3, #formEmprestimo h3').forEach(h3 => {
            h3.textContent = `${h3.textContent} - ${nomeCliente}`;
        });
        clienteInput.value = nomeCliente;

        // Exibe o nome do cliente selecionado acima dos botões
        nomeClienteSelecionado.textContent = `Cliente selecionado: ${nomeCliente}`;
    }
});

// Lógica para mostrar o calendário ao clicar em um cliente
const calendario = document.getElementById('calendario');
const conteudoCalendario = document.getElementById('conteudoCalendario');

listaClientes.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        const clienteId = event.target.dataset.clienteId;

        // Lógica para buscar os empréstimos do cliente (substitua pela sua lógica real)
        const emprestimosCliente = buscarEmprestimosDoCliente(clienteId); 

        // Preencher o conteúdo do calendário com os empréstimos
        conteudoCalendario.innerHTML = ''; // Limpa o conteúdo anterior
        emprestimosCliente.forEach(emprestimo => {
            // ... (criar elementos HTML para exibir os empréstimos no calendário) ...
        });

        calendario.style.display = 'block'; // Mostra o calendário
    }
});

// Função para buscar os empréstimos do cliente (substitua pela sua lógica real)
function buscarEmprestimosDoCliente(clienteId) {
    // ... (lógica para buscar os dados do banco de dados ou API) ...
    return [
        { data: '2024-05-25', valor: 500.00 },
        { data: '2024-06-10', valor: 300.00 },
        // ... outros empréstimos
    ];
}