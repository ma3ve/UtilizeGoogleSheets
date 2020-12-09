const { google } = require("googleapis");

const {
  client_id,
  client_secret,
  redirect_uris,
} = require("./credentials.json").web;

module.exports = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);
