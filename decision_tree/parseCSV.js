export function parseCSV(str) {
    str = str.replace(/\r/g, '');
    return str.split("\n").map(function (line) {
        return line.split(",");
    });
}

