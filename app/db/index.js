const pg = require('pg');
const config = require('../config');

const client = new pg.Client(config);

module.exports.client = client;

module.exports.initDb = async () => {
    await client.connect();

    await client.query(`CREATE TABLE IF NOT EXISTS users (
        name    varchar(40),
        password    varchar(40),
        PRIMARY KEY(password)
    );`);

    await client.query(`CREATE TABLE IF NOT EXISTS phones (
        phone    varchar(80),
        PRIMARY KEY(phone)
    );`);

    await client.query(`INSERT INTO users
            (name, password)
        SELECT 'admin', 'admin'
        WHERE
            NOT EXISTS (
                SELECT name FROM users WHERE name = 'admin');`);

    return client
}
