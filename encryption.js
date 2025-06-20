var crypto = require("crypto");
// var Blowfish = require("javascript-blowfish");
var iv = Buffer.from("");

var PADDING_LENGTH = 16;
var PADDING = Array(PADDING_LENGTH).join("\0");

var createCryptor = function(key) {
    key = Buffer.from(key);
    return function(data) {
        var cipher = crypto.createCipheriv("bf-ecb", key, iv);
        cipher.setAutoPadding(false);
        var padLength = PADDING_LENGTH - (data.length % PADDING_LENGTH);
        if (padLength === PADDING_LENGTH) {
            padLength = 0;
        }
        try {
            return Buffer.concat([
                cipher.update(data + PADDING.substr(0, padLength)),
                cipher.final()
            ]);
        } catch (e) {
            return null;
        }
    };
};

var createDecryptor = function(key) {
    key = Buffer.from(key);
    return function(data) {
        var cipher = crypto.createDecipheriv("bf-ecb", key, iv);
        cipher.setAutoPadding(false);
        try {
            return Buffer.concat([
                cipher.update(data),
                cipher.final()
            ]);
        } catch (e) {
            return null;
        }
    };
};

exports.decrypt = function(password, ciphered) {
    var blowfish = createDecryptor(password);
    var buff = blowfish(Buffer.from(ciphered, "hex"));

    return buff;
};

exports.encrypt = function(password, plain) {
    var blowfish = createCryptor(password);
    var buff = blowfish(plain);

    return buff;
};

// exports.decrypt_rus = function(password, ciphered) {
//     var bf = new Blowfish(password, 'ecb');
//     // var debased = bf.base64Decode(ciphered);
//     // var decrypted = bf.decrypt(debased);
//     var decrypted = bf.decrypt(ciphered, '');

//     decrypted = bf.trimZeros(decrypted);

//     console.log("decrypted: ", decrypted);
//     return decrypted;
// };
    
// exports.encrypt_rus = function(password, plain) {
//     var bf = new Blowfish(password, 'ecb');
//     var encrypted = bf.encrypt(plain, '');
//     // encrypted = bf.base64Encode(encrypted);

//     console.log("encrypted: ", encrypted);
//     return encrypted;
// };

exports.decrypt_new = function(password, ciphered) {
    return import("egoroof-blowfish")
        .then(module => {
            const Blowfish = module.Blowfish;
            const bf = new Blowfish(password, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);

            const decoded = bf.decode(ciphered, Blowfish.TYPE.STRING);

            console.log("decrypted finished: ", decoded);
            return decoded;
        });
};

exports.encrypt_new = function(password, plain) {
    return import("egoroof-blowfish")
        .then(module => {
            const Blowfish = module.Blowfish;
            const bf = new Blowfish(password, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);

            // encoded = bf.encode(plain, Blowfish.TYPE.STRING);
            // const buffer = Buffer.from(encoded);
            // encoded = buffer.toString('hex').toLowerCase();

            let encoded = Buffer.from(bf.encode(plain, Blowfish.TYPE.STRING)).toString('hex').toLowerCase();
            // const buffer = Buffer.from(encoded);
            // encoded = buffer.toString('hex').toLowerCase();
            
            console.log("encrypted finished: ", encoded);
            return encoded;
        });
};