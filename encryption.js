var crypto = require("crypto");
var iv = Buffer.from("");

var PADDING_LENGTH = 16;
var PADDING = Array(PADDING_LENGTH).join("\0");
var PADSTRING = PADDING.toString();

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

var new_encryptor = async function(key, data) {
    return import("egoroof-blowfish")
        .then(({Blowfish}) => {
            var padLength = PADDING_LENGTH - (data.length % PADDING_LENGTH);
            if (padLength === PADDING_LENGTH) {
                padLength = 0;
            }
            const bf = new Blowfish(key, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
            const encoded = bf.encode(data, Blowfish.TYPE.STRING);
            
            return encoded;        
         });
};

var new_decryptor = async function(key, data) {
    return import("egoroof-blowfish")
        .then(({Blowfish}) => {
            var padLength = PADDING_LENGTH - (data.length % PADDING_LENGTH);
            if (padLength === PADDING_LENGTH) {
                padLength = 0;
            }
            const bf = new Blowfish(key, Blowfish.MODE.ECB, Blowfish.PADDING.NULL);
            const decoded = bf.decode(Buffer.from(data, "hex"), Blowfish.TYPE.UINT8_ARRAY); // this looks good!

            return decoded;
        });
};

exports.decrypt_new = async function(password, ciphered) {
    let result = await new_decryptor(password, ciphered);
    let resbuffed = Buffer.from(result, "hex");

    return resbuffed;
};

exports.encrypt_new = async function(password, plain) {
    let result = await new_encryptor(password, plain);
    let resbuffed = Buffer.from(result, "hex");
    
    return resbuffed;
};
