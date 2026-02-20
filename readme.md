# Em-Presta: Sistema de Gestão de Empréstimos

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

## 🎯 Sobre o Projeto

O **Em-Presta** é um sistema web full-stack projetado para a gestão completa de operações de empréstimos. O projeto nasceu de uma demanda real de uma empresa do setor, com o objetivo de automatizar e otimizar o controle de clientes, empréstimos, pagamentos e o desempenho dos vendedores.

Inicialmente desenvolvido como uma solução sob medida, a arquitetura foi pensada para ser escalável, permitindo que, no futuro, outras empresas do ramo possam se cadastrar e utilizar a plataforma como um serviço (SaaS).

---

### 📄 Nota para Recrutadores e Avaliadores

Este repositório foi tornado público para fins de portfólio. Ele representa um dos meus primeiros projetos full-stack, onde tive a oportunidade de lidar com um problema de negócio real, desde a concepção da ideia e levantamento de requisitos até a implementação e entrega da solução.

*   **Disponibilidade para Demonstração:** Estou totalmente à disposição para subir uma instância do servidor em um ambiente de produção e realizar uma demonstração ao vivo do sistema em funcionamento.
*   **Confidencialidade:** Por questões de segurança e privacidade, o nome da empresa que financiou e utiliza o sistema foi omitido.
*   **Objetivo:** O código aqui presente demonstra minhas habilidades em organização de projetos, versionamento com Git, desenvolvimento back-end com Node.js, criação de APIs RESTful, modelagem de banco de dados relacional e desenvolvimento front-end com JavaScript puro.

---

## ✨ Funcionalidades Principais

*   **Autenticação Segura:** Sistema de login com tokens JWT (JSON Web Tokens) e hashing de senhas com Bcrypt para garantir a segurança dos dados.
*   **Gestão de Vendedores e Clientes:** Cadastro e gerenciamento completo de vendedores e sua respectiva carteira de clientes.
*   **Múltiplas Modalidades de Empréstimo:** Suporte para diferentes tipos de empréstimos (diários e mensais), com cálculos de juros e parcelas.
*   **Dashboard Intuitivo:** Painel de controle que exibe todos os empréstimos ativos, filtrando por status (ativo, atrasado, aguardando).
*   **Automação de Status de Pagamento:** Uma rotina automática (`node-cron`) é executada diariamente para verificar e atualizar o status de todos os empréstimos, identificando atrasos.
*   **Cálculo de Vencimento Inteligente:** O sistema desconsidera domingos e feriados (configuráveis por vendedor) no cálculo dos dias de pagamento para empréstimos diários.
*   **Registro Detalhado de Pagamentos:** Interface para registrar pagamentos parciais, totais ou amortizações, com atualização automática do status do empréstimo.
*   **Resumo Financeiro:** Geração de relatórios com métricas importantes, como valor total investido, lucro previsto, e quantidade de empréstimos finalizados e em atraso.
*   **Interface Responsiva:** O front-end foi desenvolvido para se adaptar a dispositivos móveis e desktops.

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia |
|-----------|------------|
| **Back-end** | Node.js, Express.js |
| **Banco de Dados** | MySQL |
| **Autenticação** | JSON Web Token (JWT), Bcrypt |
| **Front-end** | HTML5, CSS3, JavaScript (Vanilla) |
| **Agendamento de Tarefas** | Node-Cron |
| **Variáveis de Ambiente** | Dotenv |

## 🏛️ Arquitetura e Decisões de Design

*   **API RESTful Modular:** As rotas da API foram separadas em arquivos distintos (`routes/`) para melhor organização e manutenibilidade, seguindo os princípios REST.
*   **Separação de Responsabilidades (SoC):** A lógica de negócio mais complexa, como a verificação de pagamentos, foi abstraída para módulos de utilitários (`utils/`), mantendo os controllers mais limpos.
*   **Segurança:** Além da autenticação, foi utilizado um middleware para proteger as rotas que exigem login. As senhas nunca são armazenadas em texto plano.
*   **Gerenciamento de Banco de Dados:** Utilização de um pool de conexões com o `mysql2` para otimizar o uso de recursos e melhorar a performance das consultas ao banco de dados.

## 📈 Possíveis Melhorias Futuras

Como parte de um processo de evolução contínua, algumas melhorias poderiam ser implementadas:

*   **Migração do Front-end:** Adotar um framework moderno como React, Vue ou Svelte para melhorar a reatividade, gerenciamento de estado e componentização da interface.
*   **Testes Automatizados:** Implementar testes unitários e de integração (com Jest, Mocha, etc.) para garantir a estabilidade e a qualidade do código.
*   **Containerização:** Utilizar Docker e Docker Compose para simplificar a configuração do ambiente de desenvolvimento e facilitar o deploy.
*   **Validação de Dados:** Implementar uma camada de validação mais robusta para os dados de entrada da API (ex: com Joi ou Zod).

## 📬 Contato

**[Matheus Tavares]**

*   **LinkedIn:** [https://www.linkedin.com/in/matheustavares7](https://www.linkedin.com/in/matheustavares7)
*   **Email:** [tpowertech7@gmail.com]

Fique à vontade para explorar o código, abrir *issues* ou entrar em contato!