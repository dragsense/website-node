const fs = require('fs');

async function write(fileName, data) {
    fs.writeFileSync(fileName, data, { flag: 'w' });
    return true;
}

async function read(fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf-8', function (err, data) {
            if (err)
            resolve("");

            resolve(data);
        });
    });

}

module.exports = {
    write,
    read
}
    