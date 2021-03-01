
const Utils = require("../common/utils");
const ResponseParser = require("./response-parser")

class Request {
  constructor(options) {
    this.method = options.method || "GET";
    this.host = options.host;
    this.port = options.port || 80;
    this.path = options.path || "/";
    this.body = options.body || {};
    this.headers = options.headers || {};

    if (!this.headers[CONTENT_TYPE]) {
      this.headers[CONTENT_TYPE] = URLENCODED;
    }

    if (this.headers[CONTENT_TYPE] === "application/json") {
      this.bodyText = JSON.stringify(this.body);
    } else if (this.headers[CONTENT_TYPE] === URLENCODED) {
      this.bodyText = Utils.obj2qs(this.body);
    }

    this.headers["Content-Length"] = this.bodyText.length;
  }

  send() {
    return new Promise((reslove, reject) => {
      const parser = new ResponseParser;
      reslove("ok")
    });
  }
}

module.exports = Request;