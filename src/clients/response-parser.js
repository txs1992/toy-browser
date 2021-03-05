const TrunkedBodyParser = require("./trunked-body-parser");

class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0; // 状态行
    this.WAITING_STATUS_LINE_END = 1; // 状态行结束
    this.WAITING_HEADER_NAME = 2; // 请求头名称
    this.WAITING_HEADER_SPACE = 3; // 请求头空格
    this.WAITING_HEADER_VALUE = 4; // 请求值
    this.WAITING_HEADER_LINE_END = 5; // 请求行结束
    this.WAITING_HEADER_BLOCK_END = 6; // 请求块结束
    this.WAITING_BODY = 7; // 请求体

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 (\d+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(""),
    };
  }

  receive(str) {
    for (let i = 0; i < str.length; i++) {
      this.receiveChar(str.charAt(i));
    }
  }

  handleStatusLine(char) {
    if (char === "\r") {
      this.current = this.WAITING_STATUS_LINE_END;
    } else {
      this.statusLine += char;
    }
  }

  handleStatusLineEnd(char) {
    if (char === "\n") {
      this.current = this.WAITING_HEADER_NAME;
    }
  }

  handleHeaderName(char) {
    if (char === ":") {
      this.current = this.WAITING_HEADER_SPACE;
    } else if (char === "\r") {
      this.current = this.WAITING_HEADER_BLOCK_END;
      if (this.headers["Transfer-Encoding"] === "chunked") {
        this.bodyParser = new TrunkedBodyParser();
      }
    } else {
      this.headerName += char;
    }
  }

  handleHeaderSpace(char) {
    if (char === " ") {
      this.current = this.WAITING_HEADER_VALUE;
    }
  }

  handleHeaderValue(char) {
    if (char === "\r") {
      this.current = this.WAITING_HEADER_LINE_END;
      this.headers[this.headerName] = this.headerValue;
      this.headerName = "";
      this.headerValue = "";
    } else {
      this.headerValue += char;
    }
  }

  handleHeaderLineEnd(char) {
    if (char === "\n") {
      this.current = this.WAITING_HEADER_NAME;
    }
  }

  handleHeaderBlockEnd(char) {
    if (char === "\n") {
      this.current = this.WAITING_BODY;
    }
  }

  parseBody(char) {
    this.bodyParser.receiveChar(char);
  }

  receiveChar(char) {
    switch (this.current) {
      case this.WAITING_STATUS_LINE:
        this.handleStatusLine(char);
        break;
      case this.WAITING_STATUS_LINE_END:
        this.handleStatusLineEnd(char);
        break;
      case this.WAITING_HEADER_NAME:
        this.handleHeaderName(char);
        break;
      case this.WAITING_HEADER_SPACE:
        this.handleHeaderSpace(char);
        break;
      case this.WAITING_HEADER_VALUE:
        this.handleHeaderValue(char);
        break;
      case this.WAITING_HEADER_LINE_END:
        this.handleHeaderLineEnd(char);
        break;
      case this.WAITING_HEADER_BLOCK_END:
        this.handleHeaderBlockEnd(char);
        break;
      case this.WAITING_BODY:
        this.parseBody(char);
        break;
    }
  }
}

module.exports = ResponseParser;
