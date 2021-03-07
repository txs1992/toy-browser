const Request = require("./request");
const Parser = require("./html-parser")

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

  let response = await request.send();
  console.log(response)
  Parser.parseHTML(response.body)
})();

