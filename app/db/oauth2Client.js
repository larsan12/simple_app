const { client: pgClient } = require("./index")

/**
 * Get access token.
 */


module.exports.getAccessToken = async (bearerToken) => {
    let result = await pgClient.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE access_token = $1', [bearerToken])
    let token = result.rows[0]
    return {
        accessToken: token.access_token,
        accessTokenExpiresAt: token.access_token_expires_on,
        scope: token.scope,
        client: {id: token.client_id},
        user: {id: token.userId}, // could be any object
    }
}

/**
 * Get client.
 */

module.exports.getClient = async (clientId, clientSecret) => {
    let query;
    if (clientSecret) {
        query = pgClient.query("SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2", [clientId , clientSecret])
    } else {
        query = pgClient.query('SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1', [clientId])
    }

    let result = await query
    let oAuthClient = result.rows[0]

    if (!oAuthClient) {
        return;
    }

    return {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
        redirectUris: ['http://localhost'], //some urls
        grants: ['authorization_code', 'password'], // the list of OAuth2 grant types that should be allowed
    }
}

/**
 * Get refresh token.
 */

module.exports.getRefreshToken = async (bearerToken) => {
    let result = await pgClient.query('SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE refresh_token = $1', [bearerToken])
    return result.rowCount ? result.rows[0] : false;
}

/**
 * Get user.
 */

module.exports.getUser = async (username, password) => {
    let result = await pgClient.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username, password])
    return result.rowCount ? result.rows[0] : false;
}

/**
 * Save token.
 */

module.exports.saveToken = async (token, client, user) => {
    let result = await pgClient.query('INSERT INTO oauth_tokens (access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ($1, $2, $3, $4, $5, $6)', [
        token.accessToken,
        token.accessTokenExpiresAt,
        client.clientId,
        token.refreshToken,
        token.refreshTokenExpiresAt,
        user.id
        ])
    return result.rowCount ? {
        ...token,
        client: client,
        user: user
    } : false; // TODO return object with client: {id: clientId} and user: {id: userId} defined
}
