const express = require('express');
const router = express.Router();
const db = require('../db');
const autenticar = require('../middleware/auth');
const bcrypt = require('bcrypt'); // Importa o módulo bcrypt

// API teste
router.get('/', autenticar, (req, res) => {
    const sql = 'SELECT * FROM tabela_teste';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar', err);
            res.status(500).json({ error: 'Erro ao buscar' });
            return;
        }
        res.json(results);
    });
});

module.exports = router;