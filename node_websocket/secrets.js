const fs = require("fs");

const dockerSecret = {};

dockerSecret.read = function read(secretName) {
    try {
        return fs.readFileSync(`/run/secrets/${secretName}`, "utf8").trim();
    } catch (err) {
        return false;
    }
};

module.exports = dockerSecret;