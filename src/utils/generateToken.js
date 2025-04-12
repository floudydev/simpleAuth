const crypto = require("crypto");

function generate_token(length) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

module.exports = generate_token;