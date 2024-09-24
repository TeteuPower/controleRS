const mysql = require('mysql2');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

// Função para criar a conexão com o banco de dados
function createConnection() {
    const connection = mysql.createConnection(DATABASE_URL);

    // Adiciona um event listener para o evento 'error'
    connection.on('error', function(err) {
        console.error('Erro na conexão com o banco de dados:', err);

        // Verifica se o erro é um erro de conexão fechada
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('Reconectando ao banco de dados...');
            connection = createConnection(); // Recria a conexão
        } else {
            throw err; // Lança o erro para outros tratamentos de erro
        }
    });

    return connection;
}

// Cria a conexão inicial
let connection = createConnection();

module.exports = connection;