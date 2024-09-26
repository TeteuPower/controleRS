// funcoes.js

document.addEventListener('DOMContentLoaded', function() {
    carregarHeader();
});


function carregarHeader() {
    fetch('header.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('cabecalho').innerHTML = html;

    //Lógica para o header hamburguer
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');

    hamburgerMenu.addEventListener('click', function() {
        // Alterna a classe 'active' no botão hambúrguer para animá-lo
        hamburgerMenu.classList.toggle('active');

        // Exibe ou oculta o menu móvel
        mobileMenu.style.display = mobileMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Adiciona um event listener ao botão de logout
    document.getElementById('btn-logout').addEventListener('click', function() {

        // Remove o token do Local Storage
        localStorage.removeItem('token');
        localStorage.removeItem('vendedor_id');
        localStorage.removeItem('vendedor_nome');
        localStorage.removeItem('vendedor_usuario');

        // Redireciona para a página de login
        window.location.href = '/';

        alert('Logout feito com sucesso!');
    });
    document.getElementById('btn-logout-mobile').addEventListener('click', function() {

        // Remove o token do Local Storage
        localStorage.removeItem('token');
        localStorage.removeItem('vendedor_id');
        localStorage.removeItem('vendedor_nome');
        localStorage.removeItem('vendedor_usuario');

        // Redireciona para a página de login
        window.location.href = '/';

        alert('Logout feito com sucesso!');
    });
        });
}

// Função para buscar clientes e preencher um select
function buscarClientes(idSelect) {
    const select = document.getElementById(idSelect);
  
    if (!select) {
      console.error(`Elemento select com ID '${idSelect}' não encontrado.`);
      return;
    }
  
    fetch('/clientes-vendedor', {
      headers: {
        'Authorization': localStorage.getItem('token'),
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Erro ao buscar clientes.');
        }
        return response.json();
      })
      .then((clientes) => {
        select.innerHTML = '<option value="">Selecione o cliente</option>'; // Limpa as opções existentes
  
        clientes.forEach((cliente) => {
          const option = document.createElement('option');
          option.value = cliente.id;
          option.text = cliente.nome;
          select.add(option);
        });
      })
      .catch((error) => {
        console.error('Erro ao buscar clientes:', error);
        alert('Erro ao buscar clientes. Por favor, tente novamente.');
      });
}