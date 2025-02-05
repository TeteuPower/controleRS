const mysql = require('mysql2');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

// Cria um pool de conexões
const db = mysql.createPool({
    uri: DATABASE_URL,
    connectionLimit: 10, // Número máximo de conexões no pool
    waitForConnections: true, // Espera por uma conexão disponível se o pool estiver cheio; Se true, o pool aguardará por uma conexão disponível se atingir o limite. Se false, ele retornará um erro imediatamente.
    queueLimit: 0 // Define o número máximo de solicitações na fila de espera por uma conexão. 0 significa sem limite (pode consumir muita memória sob alta carga).
});

//  Essa função encapsula a lógica de obter uma conexão do pool e a retorna como uma Promise. Isso torna o código mais limpo e facilita o tratamento de erros.
function getConnection() {
    return new Promise((resolve, reject) => {
        db.getConnection((err, connection) => {
            if (err) {
                console.error('Erro ao obter conexão do pool:', err);
                reject(err); // Rejeita a promise em caso de erro
                return; // return para evitar a execução do código abaixo em caso de erro.
            }
            // Adicione um evento de erro para liberar a conexão em caso de erro durante a consulta
            connection.on('error', function(err) {
                console.error('Erro na conexão:', err);
                connection.release(); // Libera a conexão mesmo em caso de erro durante uma consulta

                console.log('Conexão fechada. Tentando abrir uma nova conexão...');
                getConnection() // Chama a função getConnection recursivamente
                .then(newConnection => {
                    resolve(newConnection); // Resolve a promessa com a nova conexão
                })
                .catch(error => {
                    reject(error); // Rejeita a promessa se houver um erro ao abrir uma nova conexão
                });
                return;
            });
                connection.release(); // Libera a conexão
                resolve(connection); // Resolve a promise com a conexão
        });
    });
}

// Cria a conexão inicial
//let connection = getConnection();

module.exports = {
    db,
    getConnection
};