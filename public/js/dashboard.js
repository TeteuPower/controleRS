document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
    const emprestimosDiariosContainer = document.getElementById('emprestimos-diarios-container');
    const emprestimosMensaisContainer = document.getElementById('emprestimos-mensais-container');
    const filtroDiarios = document.getElementById('filtro-diarios');
    const filtroMensais = document.getElementById('filtro-mensais');
  
    // Função para buscar os empréstimos diários
    function buscarEmprestimosDiarios() {
      fetch('/emprestimos-diarios', {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar empréstimos diários.');
          }
          return response.json();
        })
        .then((emprestimos) => {
          exibirEmprestimos(emprestimosDiariosContainer, emprestimos);
        })
        .catch((error) => {
          console.error('Erro ao buscar empréstimos diários:', error);
          alert('Erro ao buscar empréstimos diários. Por favor, tente novamente.');
        });
    }
  
    // Função para buscar os empréstimos mensais
    function buscarEmprestimosMensais() {
      fetch('/emprestimos-mensais', {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar empréstimos mensais.');
          }
          return response.json();
        })
        .then((emprestimos) => {
          exibirEmprestimos(emprestimosMensaisContainer, emprestimos);
        })
        .catch((error) => {
          console.error('Erro ao buscar empréstimos mensais:', error);
          alert('Erro ao buscar empréstimos mensais. Por favor, tente novamente.');
        });
    }
  
    // Função para exibir os empréstimos
    function exibirEmprestimos(container, emprestimos) {
      container.innerHTML = ''; // Limpa o container
  
      // Filtrar os empréstimos por status (se houver filtro)
      const statusFiltro = container.previousElementSibling.querySelector('select').value;
      const emprestimosFiltrados = emprestimos.filter((emprestimo) => {
        return statusFiltro === '' || emprestimo.status === statusFiltro;
      });
  
      if (emprestimosFiltrados.length === 0) {
        container.innerHTML = '<p>Nenhum empréstimo encontrado.</p>';
        return;
      }
  
      emprestimosFiltrados.forEach((emprestimo) => {
        //console.log(emprestimo)
        const emprestimoItem = document.createElement('div');
        emprestimoItem.classList.add('emprestimo-item');
        emprestimoItem.classList.add(emprestimo.status);
  
        let infoEmprestimo = `
          <div class="info">
            <!--<strong>ID:</strong> ${emprestimo.id} - -->
            <strong>${emprestimo.nome_cliente}</strong> - 
            <strong></strong> R$ ${formatarValor(emprestimo.valor_total)} - 
            <strong></strong>${emprestimo.taxa_juros}% 
        `;
  
        if (emprestimo.tipo === 'diario') {
          //console.log(emprestimo)
          infoEmprestimo += ` - <strong>Pago:</strong> ${formatarValor(emprestimo.total_pago)} de ${(emprestimo.valor_total * ((emprestimo.taxa_juros / 100)+1))} | ${parseInt(emprestimo.total_pago / (emprestimo.valor_total * (((emprestimo.taxa_juros / 100)+1)/emprestimo.numero_dias)))} de ${emprestimo.numero_dias} `;
        } else {
          infoEmprestimo += ` - <strong>Valor da Parcela:</strong> R$ ${emprestimo.valor_total * (emprestimo.taxa_juros / 100)} - 
            <strong>Dia:</strong> ${new Date(emprestimo.data_inicio).getDate()} `;
        }
  
        infoEmprestimo += `</div>
          <div class="status">Status: ${emprestimo.status}</div>
        `;
  
        emprestimoItem.innerHTML = infoEmprestimo;
        container.appendChild(emprestimoItem);
      });
    }
  
    // Chamar as funções para buscar os empréstimos ao carregar a página
    buscarEmprestimosDiarios();
    buscarEmprestimosMensais();
  
    // Adicionar ouvintes de eventos para os filtros
    filtroDiarios.addEventListener('change', buscarEmprestimosDiarios);
    filtroMensais.addEventListener('change', buscarEmprestimosMensais);
  });