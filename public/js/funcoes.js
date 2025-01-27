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
        localStorage.removeItem('vendedor_nome');

        // Redireciona para a página de login
        window.location.href = '/';

        alert('Logout feito com sucesso!');
    });
    document.getElementById('btn-logout-mobile').addEventListener('click', function() {

        // Remove o token do Local Storage
        localStorage.removeItem('token');
        localStorage.removeItem('vendedor_nome');

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
function verificarAutenticacao() {
  const token = localStorage.getItem('token');

  // Verifica se estamos na página de login
  const isLoginPage = window.location.pathname === '/html/index.html' || window.location.pathname === '/';

  if (isLoginPage) {
      // Se estiver na página de login, exibe o conteúdo
      document.body.classList.add('visivel');
      return Promise.resolve(true); // Retorna uma promessa resolvida para evitar erros nas páginas protegidas
  }

  if (!token) {
      // Redireciona para a página de login se não houver token
      alert('Você deve fazer o Login primeiro');
      window.location.href = '/';
      return Promise.reject(false); // Retorna uma promessa rejeitada para evitar erros nas páginas protegidas
  }

  // Função para verificar a validade do token
  function verificarToken() {
      fetch('/api/verificar-token', {
          headers: {
              'Authorization': token
          }
      })
      .then(response => {
          if (!response.ok) {
              alert('Token de segurança vencido, faça o login novamente');
              localStorage.removeItem('token');
              localStorage.removeItem('vendedor_nome');
              window.location.href = '/';
          }
      })
      .catch(error => {
          console.error('Erro ao verificar o token:', error);
      });
  }

  // Verifica a validade do token imediatamente
  verificarToken();

  // Verifica a validade do token a cada 10 segundos (10000 milissegundos)
  setInterval(verificarToken, 300000);

  // Adiciona a classe 'visivel' ao body para exibir o conteúdo
  document.body.classList.add('visivel');
  return Promise.resolve(true);
}

// Função para formatar datas
function formatarData(dataString) {
  const data = new Date(dataString);
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// Função para formatar valores para o padrão brasileiro
function formatarValor(valor) {
  valor = parseFloat(valor).toFixed(2); // Garante duas casas decimais
  const partes = valor.split('.');
  const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona ponto a cada três dígitos
  const decimal = partes[1];
  return inteiro + ',' + decimal; // Junta as partes com vírgula
}

async function obterHoraServidor() {
  return fetch('/api/hora-servidor')
      .then(response => {
          if (!response.ok) {
              throw new Error('Erro ao obter a hora do servidor.');
          }
          return response.json();
      })
      .then(data => {
          return data.hora;
      })
      .catch(error => {
          console.error('Erro ao obter a hora do servidor:', error);
          return 'Erro ao obter a hora';
      });
}

function atualizarHoraServidor() {
  obterHoraServidor()
      .then(hora => {
          document.getElementById('hora-servidor').textContent = `Hora do Servidor: ${hora}`;
      });
}