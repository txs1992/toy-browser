const net = require("net");
const Utils = require("../common/utils");
const ResponseParser = require("./response-parser");

const CONTENT_TYPE = "Content-Type";
const URLENCODED = "application/x-www-form-urlencoded";

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

  send(connection) {
    return new Promise((reslove, reject) => {
      const parser = new ResponseParser();

      // 如果有 TCP 连接就复用，否则就创建新的 TCP 连接
      if (connection) {
        connection.write(this.toString());
      } else {
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            connection.write(this.toString());
          }
        );
      }

      connection
        .on("data", (data) => {
          console.log("data")
          parser.receive(data.toString());

          if (parser.isFinished) {
            reslove(parser.response);
            connection.end();
          }
        })
        .on("error", (err) => {
          reject(err);
          connection.end();
        });

      // reslove("ok");
    });
  }

  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers)
      .map((key) => `${key}: ${this.headers[key]}`)
      .join("\r\n")}\r\n\r\n${this.bodyText}`;
  }
}

module.exports = Request;
