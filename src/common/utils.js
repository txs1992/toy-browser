class Utils {
  static isObject(value) {
    const type = typeof value;
    return value != null && type === "object";
  }

  static obj2qs(obj, first = false, transcoding = true) {
    if (!this.isObject(obj)) return "";

    const result = Object.keys(obj)
      .map((key) => {
        let value = obj[key];
        if (this.isObject(value)) value = JSON.stringify(value);
        return `${key}=${transcoding ? encodeURIComponent(value) : value}`;
      })
      .join("&");

    return first ? `?${result}` : result;
  }
}

module.exports = Utils;
