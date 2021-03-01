class ResponseParser {
  constructor() {}

  receive(str) {
    for (let i = 0; i < str.length; i++) {
      this.receiveChar(str.charAt(i));
    }
  }

  receiveChar(char) {}
}

module.exports = ResponseParser;
