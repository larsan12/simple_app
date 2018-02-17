const pg = require('pg')
const config = require('../config')

const client = new pg.Client(config)

module.exports.client = client

module.exports.initDb = async () => {
    await client.connect()

    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

    await client.query(`CREATE TABLE IF NOT EXISTS users (
        id uuid NOT NULL DEFAULT uuid_generate_v1(),
        username    text NOT NULL,
        password    text NOT NULL,
        PRIMARY KEY(id)
    );`)

    await client.query(`CREATE TABLE IF NOT EXISTS phones (
        phone    varchar(80),
        PRIMARY KEY(phone)
    );`)

    /*
       Oauth models
    */

    await client.query(`CREATE TABLE IF NOT EXISTS oauth_tokens (
        id uuid NOT NULL DEFAULT uuid_generate_v1(),
        access_token text NOT NULL,
        access_token_expires_on timestamp without time zone NOT NULL,
        client_id text NOT NULL,
        refresh_token text NOT NULL,
        refresh_token_expires_on timestamp without time zone NOT NULL,
        user_id uuid NOT NULL,
        PRIMARY KEY(id)
    );`)

    await client.query(`CREATE TABLE IF NOT EXISTS oauth_clients (
        client_id text NOT NULL,
        client_secret text NOT NULL,
        redirect_uri text NOT NULL,
        PRIMARY KEY (client_id, client_secret)
    );`)


    /*
        Default values
    */

    await client.query(`INSERT INTO users
            (username, password)
        SELECT 'admin', 'admin'
        WHERE
            NOT EXISTS (
                SELECT username FROM users WHERE username = 'admin');`)


    await client.query(`INSERT INTO oauth_clients
            (client_id, client_secret, redirect_uri)
        SELECT 'key1', 'key2', '/some_url'
        WHERE
            NOT EXISTS (
                SELECT client_id FROM oauth_clients WHERE client_id = 'key1');`)

    return client
}
