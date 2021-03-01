const net = require("net");
const Request = require("./request");

const CONTENT_TYPE = "Content-Type";
const URLENCODED = "application/x-www-form-urlencoded";

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
