function commaSeparated([key, value]) {
    return key + "," + value;
}
function stringify(data) {
    if (Array.isArray(data)) {
        return data.map(function (item) {
            return item.join(",");
        }).join("\n");
    }
    return Object.entries(data).map(commaSeparated);
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
function makeBlob(content, window) {
    return new window.Blob([content], {type: "text/csv"});
}
function save(content, filename, writer, window) {
    const blob = makeBlob(content, window);
    writer(blob, filename);
}
export default Object.freeze({
    stringify,
    parse,
    load,
    loadHandler,
    makeBlob,
    save
});