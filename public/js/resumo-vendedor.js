document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacao();
    const emprestimosAtivos = document.getElementById('emprestimos-ativos');
    const valorTotalInvestido = document.getElementById('valor-total-investido');
    const lucroDiario = document.getElementById('lucro-diario');
    const lucroMensal = document.getElementById('lucro-mensal');
    const emprestimosDiariosAtrasados = document.getElementById('emprestimos-diarios-atrasados');
    const emprestimosMensaisAtrasados = document.getElementById('emprestimos-mensais-atrasados');
    const emprestimosMensaisFinalizados = document.getElementById('emprestimos-mensais-finalizados');
    const emprestimosDiariosFinalizados = document.getElementById('emprestimos-diarios-finalizados');
    const lucroTotalDiario = document.getElementById('lucro-total-diario');
    const lucroTotalMensal = document.getElementById('lucro-total-mensal');
  
    // Função para buscar o resumo do vendedor
    function buscarResumo() {
      fetch('/resumo-vendedor', {
        headers: {
          'Authorization': localStorage.getItem('token'),
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao buscar resumo.');
          }
          return response.json();
        })
        .then((resumo) => {
          // Preencher os elementos com os valores do resumo
          emprestimosAtivos.textContent = resumo.emprestimosAtivos;
          valorTotalInvestido.textContent = resumo.valorTotalInvestido;
          lucroDiario.textContent = resumo.lucroDiario;
          lucroMensal.textContent = resumo.lucroMensal;
          emprestimosDiariosAtrasados.textContent = resumo.emprestimosDiariosAtrasados;
          emprestimosMensaisAtrasados.textContent = resumo.emprestimosMensaisAtrasados;
          emprestimosMensaisFinalizados.textContent = resumo.emprestimosMensaisFinalizados;
          emprestimosDiariosFinalizados.textContent = resumo.emprestimosDiariosFinalizados;
          lucroTotalDiario.textContent = resumo.lucroTotalDiario;
          lucroTotalMensal.textContent = resumo.lucroTotalMensal;
        })
        .catch((error) => {
          console.error('Erro ao buscar resumo:', error);
          alert('Erro ao buscar resumo. Por favor, tente novamente.');
        });
    }
  
    // Chamar a função para buscar o resumo ao carregar a página
    buscarResumo();
  });