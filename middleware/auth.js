const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    try {
        // Obtém a chave secreta da variável de ambiente JWT_SECRET
        const secretKey = process.env.JWT_SECRET; 

        // Verifica se a chave secreta está definida
        if (!secretKey) {
            return res.status(500).json({ error: 'Chave secreta JWT não configurada no servidor.' });
        }

        const decoded = jwt.verify(token, secretKey);
        req.usuario = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
}

module.exports = autenticar;


/*const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, 'sua_chave_secreta'); // Substitua 'sua_chave_secreta' por uma chave secreta forte
        req.usuario = decoded; // Define o usuário autenticado na requisição
        next(); // Permite que a requisição continue para a próxima rota
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
}

module.exports = autenticar;*/