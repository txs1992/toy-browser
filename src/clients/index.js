
const images = require("images");
const render = require("./render");
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

  const dom = Parser.parseHTML(response.body);

  const viewport = images(800, 600);

  // render(viewport, dom.children[1].children[3].children[1].children[3]);
  render(viewport, dom);
  
  viewport.save("dom.png");
})();
