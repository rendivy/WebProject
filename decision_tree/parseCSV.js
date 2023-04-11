export function parseCSV(str) {
    str = str.replace(/\r/g, '');
    return str.split("\n").map(function (line) {
        if (line.length > 0) {
            return line.split(",").filter(function (item) {
                return item.length > 0;
            });
        }
    }).filter(function (item) {
        return item !== undefined;
    });
}

