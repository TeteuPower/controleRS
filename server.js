const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db'); // Importa o módulo de conexão com o banco de dados
const app = express();
const jwt = require('jsonwebtoken'); // Importa o módulo jsonwebtoken
const request = require('request')
const autenticar = require('./middleware/auth'); // Importa o middleware de autenticação
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

// API teste
//app.use('/api/teste', autenticar, require('./routes/teste'));

// Rota para login do administrador (gera o token)
app.post('/api/login', (req, res) => {
    const { senha } = req.body;

    const sql = `SELECT * FROM administradores WHERE senha = ?`;
    db.query(sql, [senha], (err, results) => {
        if (err) {
            console.error('Erro ao verificar a senha:', err);
            res.status(500).json({ error: 'Erro ao verificar a senha.' });
            return;
        }

        if (results.length > 0) {
            // Senha correta!
            const administrador = results[0];

            // Gera um token JWT com o ID do administrador
            const token = jwt.sign({ id: administrador.id }, process.env.JWT_SECRET, {expiresIn: '1h'});

            res.json({ token });
            
        } else {
            res.status(401).json({ error: 'Senha incorreta.' });
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