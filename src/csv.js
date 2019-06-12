function commaSeparated([key, value]) {
    return key + "," + value;
}
function convertToCsv(data) {
    return Object.entries(data).map(commaSeparated);
}
function stringify(data) {
    return convertToCsv(data);
}
function splitByComma(line) {
    return line.split(",");
}
function parse(csvText) {
    return csvText.split("\n").map(splitByComma);
}
function load(evt, success, reader) {
    var inputField = evt.target;
    var file = inputField.files[0];
    reader.readAsText(file, "UTF-8");
    reader.onload = function contentLoaded(readerEvent) {
        var content = readerEvent.target.result;
        var csvArr = parse(content);
        success(csvArr, file.name);
    };
}
function loadHandler(callback, reader) {
    return function handler(evt) {
        return load(evt, callback, reader);
    };
}
export default Object.freeze({
    stringify,
    parse,
    load,
    loadHandler
});