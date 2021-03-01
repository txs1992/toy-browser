const net = require("net");
const Utils = require("./common/utils");

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

  send() {
    return new Promise((reslove, reject) => {});
  }
}

void (async function () {
  let request = new Request({
    method: "POST",
    host: "127.0.0.1",
    port: "8088",
    path: "/",
    headers: {
      ["X-FOO2"]: "customed",
    },
    body: {
      name: "MT",
    },
  });

  console.log(request)
  let response = await request.send();
  console.log(response)
})();

// console.log(Utils.toString())
