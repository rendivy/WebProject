function parseCSV(str) {
    return str.split("\n").map(function (line) {
        return line.split(",");
    });
}
module.exports = { parseCSV };
