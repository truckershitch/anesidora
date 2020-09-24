/* jshint node: true, esversion: 6, unused: false */
var anesidora = require('../../anesidora.js');
var config = require('./config.js');

const pandora = new anesidora(config.PANDORA_EMAIL, config.PANDORA_PASSWORD);

function retrieveOneSong() {
    const fnName = 'retrieveOneSong';
    return new Promise((resolve, reject) => {
         pandora.login()
            .then(() => {
                console.log('login successful!\nRetrieving stationList object...');
                return pandora.request('user.getStationList');
            })
            .then(stationList => {
                let station = stationList.stations[0];
                return pandora.request('station.getPlaylist', {
                    stationToken: station.stationToken,
                    additionalAudioUrl: 'HTTP_128_MP3'
                })
                .then(playlist => {
                    let track = playlist.items[0];
                    let response = 'First track: "' + track.songName +
                        '" by ' + track.artistName +
                        '\nurl: ' + track.additionalAudioUrl;
                    resolve(response);
                });
            })
            .catch(err => reject(new Error(fnName + ' error: ' + err))); 
    });
}

retrieveOneSong()
    .then(response => console.log(response))
    .catch(err => console.log(err));
