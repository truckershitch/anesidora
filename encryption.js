// var crypto = require("crypto");
var Blowfish = require("javascript-blowfish");
var iv = Buffer.from("");

var PADDING_LENGTH = 16;
var PADDING = Array(PADDING_LENGTH).join("\0");

// var createCryptor = function(key) {
//     key = Buffer.from(key);
//     return function(data) {
//         var cipher = crypto.createCipheriv("bf-ecb", key, iv);
//         cipher.setAutoPadding(false);
//         var padLength = PADDING_LENGTH - (data.length % PADDING_LENGTH);
//         if (padLength === PADDING_LENGTH) {
//             padLength = 0;
//         }
//         try {
//             return Buffer.concat([
//                 cipher.update(data + PADDING.substr(0, padLength)),
//                 cipher.final()
//             ]);
//         } catch (e) {
//             return null;
//         }
//     };
// };

// var createDecryptor = function(key) {
//     key = Buffer.from(key);
//     return function(data) {
//         var cipher = crypto.createDecipheriv("bf-ecb", key, iv);
//         cipher.setAutoPadding(false);
//         try {
//             return Buffer.concat([
//                 cipher.update(data),
//                 cipher.final()
//             ]);
//         } catch (e) {
//             return null;
//         }
//     };
// };

// exports.decrypt = function(password, ciphered) {
//     var blowfish = createDecryptor(password);
//     var buff = blowfish(Buffer.from(ciphered, "hex"));

//     return buff;
// };

// exports.encrypt = function(password, plain) {
//     var blowfish = createCryptor(password);
//     var buff = blowfish(plain);

//     return buff;
// };

exports.decrypt = function(password, ciphered) {
    const bf = new Blowfish(password);
    let decrypted = bf.decrypt(ciphered);
    decrypted = bf.trimZeros(decrypted);

    return decrypted;
};
    
exports.encrypt = function(password, plain) {
    const bf = new Blowfish(password);
    const encrypted = bf.encrypt(plain);

    return encrypted;
};
