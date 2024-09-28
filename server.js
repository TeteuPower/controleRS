const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db'); // Importa o módulo de conexão com o banco de dados
const app = express();
const jwt = require('jsonwebtoken'); // Importa o módulo jsonwebtoken
const request = require('request')
const autenticar = require('./middleware/auth'); // Importa o middleware de autenticação
const bcrypt = require('bcrypt');
require('dotenv').config(); // Carrega as variáveis do .env

// Middleware para processar o corpo das requisições POST
app.use(bodyParser.json()); 

// Define as pastas 'html', 'css' e 'js' como pastas de arquivos estáticos
app.use('/html', express.static(path.join(__dirname, 'public', 'html'), {
    setHeaders: function (res, path, stat) {
        res.setHeader('Content-Type', 'text/html');
    }
}));
app.use('/css', express.static(path.join(__dirname, 'public', 'css'), {
    setHeaders: function (res, path, stat) {
        res.setHeader('Content-Type', 'text/css');
    }
}));
app.use('/js', express.static(path.join(__dirname, 'public', 'js'), {
    setHeaders: function (res, path, stat) {
        res.setHeader('Content-Type', 'text/javascript');
    }
}));
app.use('/statics', express.static(path.join(__dirname, 'statics')));

// Define a rota para a página de login (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

module.exports = {
    app: app // Exporta também o app do express
};
///////////////////////API'S///////////////////////////////////

//API teste
app.get('/teste', (req, res) => {
    res.json({ message: 'Tudo ok por aqui!'})
})

// API para cadastrar vendedores
app.use('/cadastrar-vendedor', autenticar, require('./routes/cadastrar-vendedor'));
// API para cadastrar clientes
app.use('/cadastrar-cliente', autenticar, require('./routes/cadastrar-cliente'));
// API para mudar senha
app.use('/mudar-senha', autenticar, require('./routes/mudar-senha'));
// API para mudar usuário
app.use('/mudar-usuario', autenticar, require('./routes/mudar-usuario'));
// API para registrar novo empréstimo
app.use('/cadastrar-emprestimo', autenticar, require('./routes/cadastrar-emprestimo'));
// Rota para obter os clientes do vendedor
app.use('/clientes-vendedor', autenticar, require('./routes/clientes-vendedor'));
// Rota para obter os empréstimos do cliente
app.use('/emprestimos-cliente', autenticar, require('./routes/emprestimos-cliente'));
// Rota para registrar novo pagamento
app.use('/registrar-pagamento', autenticar, require('./routes/registrar-pagamento'));
// Rota para buscar empréstimos diários
app.use('/emprestimos-diarios', autenticar, require('./routes/emprestimos-diarios'));
// Rota para buscar empréstimos mensais
app.use('/emprestimos-mensais', autenticar, require('./routes/emprestimos-mensais'));
// Rota para buscar resumo do vendedor
app.use('/resumo-vendedor', autenticar, require('./routes/resumo-vendedor'));
// Rota para buscar historico de pagamentos
app.use('/historico-pagamentos', autenticar, require('./routes/historico-pagamentos'));
// API para buscar feriados
app.use('/feriados', autenticar, require('./routes/feriados'));

// Rota para login do administrador (gera o token)
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body; // Recebe usuário e senha

    const sql = `SELECT * FROM vendedores WHERE usuario = ?`; // Busca por usuário
    db.query(sql, [usuario], async (err, results) => {
        if (err) {
            console.error('Erro ao verificar o usuário:', err);
            return res.status(500).json({ error: 'Erro ao verificar o usuário.' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado.' }); 
        }

        const administrador = results[0];

        try {
            // Compara a senha fornecida com o hash armazenado
            const senhaValida = await bcrypt.compare(senha, administrador.senha); 

            if (senhaValida) {
                const token = jwt.sign({ id: administrador.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                return res.json({ token, id: administrador.id, nome: administrador.nome, usuario: administrador.usuario });
            } else {
                return res.status(401).json({ error: 'Senha incorreta.' });
            }
        } catch (err) {
            console.error('Erro ao comparar senhas:', err);
            return res.status(500).json({ error: 'Erro ao verificar a senha.' });
        }
    });
});

// Rota para decodificar o token JWT
app.get('/api/decodificar-token', autenticar, (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ id: decoded.id }); // Envia o ID do administrador como resposta
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
});

// Rota para verificar a validade do token JWT
app.get('/api/verificar-token', autenticar, (req, res) => {
    // Se o middleware autenticar for bem-sucedido, o token é válido
    res.json({ valido: true });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
});