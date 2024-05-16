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

