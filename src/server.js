const http = require("http");

const startTemplate = `
<html maaa=a >
  <head>
    <style>
      body div #myid {
        width: 100px;
        background-color: #ff50000;
      }

      body div img {
        width: 30px;
        background-color: #f11;
      }
    </style>
  </head>
  <body>
      <div>
        <img id="myid" />
        <img />
      </div>
  </body>
</html>
`;

const flexTemplate = `
<html maaa=a >
  <head>
    <style>
      #container {
        display: flex;
        width: 500px;
        height: 300px;
        background-color: #ff50000;
      }

      #container #myid {
        width: 200px;
        background-color: #f11;
      }

      #container .c1 {
        flex: 1;
        background-color: #fff;
      }
    </style>
  </head>
  <body>
      <div id="container">
        <div id="myid"></div>
        <div class="c1"></div>
      </div>
  </body>
</html>
`;

const renderTemplate = `
<html maaa=a >
  <head>
    <style>
      #container {
        display: flex;
        width: 500px;
        height: 300px;
        background-color: rgb(255, 255, 255)
      }

      #container #myid {
        width: 200px;
        background-color: rgb(255, 0, 0);
      }

      #container .c1 {
        flex: 1;
        background-color: rgb(0, 255, 0);
      }
    </style>
  </head>
  <body>
      <div id="container">
        <div id="myid"></div>
        <div class="c1"></div>
      </div>
  </body>
</html>
`;

http
  .createServer((request, response) => {
    let body = [];

    request
      .on("error", (err) => {
        console.error(err);
      })
      .on("data", (chunk) => {
        body.push(chunk.toString());
      })
      .on("end", () => {
        body = Buffer.concat([Buffer.from(body.toString())]).toString();
        console.log("body：", body);
        response.writeHead(200, { "Content-Type": "text/html" });
        // response.end(" Hello World\n");
        response.end(renderTemplate);
      });
  })
  .listen(8088);

console.log("server stared");
