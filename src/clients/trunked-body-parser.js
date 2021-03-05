class TrunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_TRUNK = 2;
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;

    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WAITING_LENGTH;
  }

  parseLength(char) {
    if (char === "\r") {
      if (this.length === 0) {
        this.isFinished = true;
      }
      this.current = this.WAITING_LENGTH_LINE_END;
    } else {
      this.length *= 16;
      this.length += parseInt(char, 16);
    }
  }

  parseLengthLineEnd(char) {
    if (char === "\n") {
      this.current = this.READING_TRUNK;
    }
  }

  parseReadingTrunk(char) {
    this.content.push(char);
    this.length--;

    if (this.length === 0) {
      this.current = this.WAITING_NEW_LINE;
    }
  }

  parseNewLine(char) {
    if (char === "\r") {
      this.current = this.WAITING_NEW_LINE_END;
    }
  }

  parseNewLineEnd(char) {
    if (char === "\n") {
      this.current = this.WAITING_LENGTH;
    }
  }

  receiveChar(char) {
    switch (this.current) {
      case this.WAITING_LENGTH:
        this.parseLength(char);
        break;
      case this.WAITING_LENGTH_LINE_END:
        this.parseLengthLineEnd(char);
        break;
      case this.READING_TRUNK:
        this.parseReadingTrunk(char);
        break;
      case this.WAITING_NEW_LINE:
        this.parseNewLine(char);
        break;
      case this.WAITING_NEW_LINE_END:
        this.parseNewLineEnd(char);
        break;
    }
  }
}

module.exports = TrunkedBodyParser;
