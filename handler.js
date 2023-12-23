'use strict';
const app = require("./app.js");
const serverless = require("serverless-http")
module.exports.hello = serverless(app);
