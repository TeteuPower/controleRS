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
        localStorage.removeItem('vendedor');

        // Redireciona para a página de login
        window.location.href = '/';

        alert('Logout feito com sucesso!');
    });
    document.getElementById('btn-logout-mobile').addEventListener('click', function() {

        // Remove o token do Local Storage
        localStorage.removeItem('token');
        localStorage.removeItem('vendedor');

        // Redireciona para a página de login
        window.location.href = '/';

        alert('Logout feito com sucesso!');
    });
        });
}