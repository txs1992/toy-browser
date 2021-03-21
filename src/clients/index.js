const Request = require("./request");
const Parser = require("./html-parser");

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
  // console.log(response)
  const dom = Parser.parseHTML(response.body);
  // console.log(JSON.stringify(dom, null, "        "));
  // Parser.parseHTML(response.body)
})();
