/* jshint node: true, esversion: 6, unused: false */
var fetch = require('node-fetch');
var encryption = require('./encryption');

var Anesidora = (function () {
    var Anesidora = function (username, password, partnerInfo) {
        if (partnerInfo == null) {
            partnerInfo = {
                username: 'android',
                password: 'AC7IBG09A3DTSYM4R41UJWL07VLN8JI7',
                deviceModel: 'android-generic',
                decryptPassword: 'R=U!LH$O2B#',
                encryptPassword: '6#26FRL$ZWD'
            };
        }
        this.username = username;
        this.password = password;
        this.partnerInfo = partnerInfo;
        this.partnerInfo.version = '5';
        this.authData = null;

        const int_users = ['pandora one', 'windowsgadget'];
        Anesidora.ENDPOINT = int_users.includes(partnerInfo.username) ?
            '://internal-tuner.pandora.com/services/json' :
            '://tuner.pandora.com/services/json/';
    };

    var bakeURL = function (secure, qsObj) {
        return queryString(qsObj)
            .then(qs => Promise.resolve(
                (secure ? 'https' : 'http') +
                Anesidora.ENDPOINT + qs));
    };

    var queryString = function (qsObj) {
        function sep (count) {
            return count == 0 ? '?' : '&';
        }

        const entries = Object.entries(qsObj);
        let qs = '';
        for (var i = 0; i < entries.length; i++) {
            qs += sep(i) + entries[i][0] +
                 '=' + encodeURIComponent(entries[i][1]);
        }
        return Promise.resolve(qs);
    };

    var seconds = function () {
        return Date.now() / 1000 | 0;
    };

    var handleResObj = function (resObj) {
        return new Promise((resolve, reject) => {
            if (resObj.stat === 'fail') {
                reject(new Error(resObj.message + ' [' + resObj.code + ']'));
            }
            else if (resObj.stat === 'ok') {
                resolve(resObj.result);
            }
            else reject(new Error('Unknown error'));
        });
    };

    var decryptSyncTime = function (password, ciphered) {
        return parseInt(encryption.decrypt(password, ciphered).toString('utf8', 4, 14), 10);
    };

    var partnerLogin = function (partnerInfo) {
        return bakeURL(true, {
            method: 'auth.partnerLogin'
        })
        .then(url => fetch(url, {
            'method': 'post',
            'body': JSON.stringify({
                username: partnerInfo.username,
                password: partnerInfo.password,
                deviceModel: partnerInfo.deviceModel,
                version: partnerInfo.version
            })
        }))
        .then(res => res.json())
        .then(resObj => {
            resObj.result.syncTimeOffset =
                decryptSyncTime(partnerInfo.decryptPassword, resObj.result.syncTime) - seconds();
            return handleResObj(resObj);
        })
        .catch(err => Promise.reject(new Error('anesidora::partnerLogin error: ' + err)));
    };

    var userLogin = function (encryptPassword, partnerData, username, password) {
        return bakeURL(true, {
            method: 'auth.userLogin',
            auth_token: partnerData.partnerAuthToken,
            partner_id: partnerData.partnerId
        })
        .then(url => fetch(url, {
            method: 'post',
            body: encryption.encrypt(encryptPassword, JSON.stringify({
                loginType: 'user',
                username: username,
                password: password,
                partnerAuthToken: partnerData.partnerAuthToken,
                syncTime: partnerData.syncTimeOffset + seconds()
            })).toString('hex').toLowerCase()
        }))
        .then(res => res.json())
        .then(resObj => handleResObj(resObj))
        .catch(err => Promise.reject(new Error('anesidora::userLogin error: ' + err)));
    };

    Anesidora.prototype.login = function () {
        const that = this;

        return partnerLogin(that.partnerInfo)
            .then(partner => {
                return userLogin(that.partnerInfo.encryptPassword, partner, that.username, that.password)
                    .then(user => {
                        that.authData =  {
                            userAuthToken: user.userAuthToken,
                            partnerId: partner.partnerId,
                            userId: user.userId,
                            syncTimeOffset: partner.syncTimeOffset
                        };
                        return Promise.resolve();
                    });
            })
            .catch(err => Promise.reject(new Error('anesidora::login error: ' + err)));
    };

    Anesidora.prototype.request = function (method, data) {
        const that = this;

        if (data == null) data = {};

        if (that.authData == null) {
            return Promise.reject(new Error('Not authenticated with Pandora (call login() before request())'));
        }

        let secure = false;
        if (method === 'station.getPlaylist') secure = true;
        
        return bakeURL(secure, {
            method: method,
            auth_token: that.authData.userAuthToken,
            partner_id: that.authData.partnerId,
            user_id: that.authData.userId
        })
        .then(url => {
            data.userAuthToken = that.authData.userAuthToken;
            data.syncTime = that.authData.syncTimeOffset + seconds();
            let encryptedBody = encryption.encrypt(that.partnerInfo.encryptPassword, JSON.stringify(data)).toString('hex').toLowerCase();
            if (method === 'test.checkLicensing') encryptedBody = null;
            return fetch(url, {
                method: 'post',
                body: encryptedBody
            });
        })
        .then(res => res.json())
        .then(resObj => handleResObj(resObj));
    };

    return Anesidora;
})();

module.exports = Anesidora;

// NEED TO MAKE ALL FUNCTIONS RETURN PROMISES IF POSSIBLE