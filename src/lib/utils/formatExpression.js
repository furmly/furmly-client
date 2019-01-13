export default function(string, ...rest) {
  var str = string.toString();
  var res = "" + str;
  if (rest.length) {
    var t = typeof rest[0];
    var arr;
    var exp = /(\{([\w|_]+)\})/g;
    var args = "string" === t || "number" === t ? rest : rest[0];

    while ((arr = exp.exec(str))) {
      res = res.replace(arr[0], args[arr[2]] || "");
    }
    str = res;
  }

  return str;
}
