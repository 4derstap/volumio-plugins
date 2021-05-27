'use strict';

var libQ = require('kew');
var fs = require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = ControllerWelle;
function ControllerWelle(context) {
    var self = this;

    this.context = context;
    this.commandRouter = this.context.coreCommand;
    this.logger = this.context.logger;
    this.configManager = this.context.configManager;
    this.serviceName = 'welle_io';
    this.loadRadioI18nStrings();
}



ControllerWelle.prototype.onVolumioStart = function () {
    var self = this;
    var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
    this.config = new (require('v-conf'))();
    this.config.loadFile(configFile);

    return libQ.resolve();
}

ControllerWelle.prototype.onStart = function () {
    var self = this;

    self.mpdPlugin = this.commandRouter.pluginManager.getPlugin('music_service', 'mpd');
    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] onStart');

    //self.loadRadioI18nStrings();
    //self.addRadioResource();
    self.addToBrowseSources();

    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] onStart - done');
    // Once the Plugin has successfull started resolve the promise
    return libQ.resolve();
};

ControllerWelle.prototype.onStop = function () {
    var self = this;
    var defer = libQ.defer();

    self.removeFromBrowseSources();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

ControllerWelle.prototype.onRestart = function () {
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

ControllerWelle.prototype.getUIConfig = function () {
    var defer = libQ.defer();
    var self = this;

    var lang_code = this.commandRouter.sharedVars.get('language_code');

    self.commandRouter.i18nJson(__dirname + '/i18n/strings_' + lang_code + '.json',
        __dirname + '/i18n/strings_en.json',
        __dirname + '/UIConfig.json')
        .then(function (uiconf) {


            defer.resolve(uiconf);
        })
        .fail(function () {
            defer.reject(new Error());
        });

    return defer.promise;
};

ControllerWelle.prototype.getConfigurationFiles = function () {
    return ['config.json'];
}

ControllerWelle.prototype.setUIConfig = function (data) {
    var self = this;
    //Perform your installation tasks here
};

ControllerWelle.prototype.getConf = function (varName) {
    var self = this;
    //Perform your installation tasks here
};

ControllerWelle.prototype.setConf = function (varName, varValue) {
    var self = this;
    //Perform your installation tasks here
};



// Playback Controls ---------------------------------------------------------------------------------------
// If your plugin is not a music_sevice don't use this part and delete it


ControllerWelle.prototype.addToBrowseSources = function () {
    var self = this;

    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] addToBrowseSources');
    // Use this function to add your music service plugin to music sources
    var data = {
        name: self.getRadioI18nString('PLUGIN_NAME'),
        uri: self.serviceName,
        plugin_type: 'music_service',
        plugin_name: self.serviceName,
        albumart: '/albumart?sourceicon=music_service/welle_io/icon.png'
    };
    this.commandRouter.volumioAddToBrowseSources(data);
};

ControllerWelle.prototype.removeFromBrowseSources = function () {
    // Use this function to add your music service plugin to music sources
    var self = this;

    self.commandRouter.volumioRemoveToBrowseSources(self.getRadioI18nString('PLUGIN_NAME'));
};

ControllerWelle.prototype.handleBrowseUri = function (curUri) {
    var self = this;
    var response;
    var defer = libQ.defer();

    //self.commandRouter.logger.info(curUri);
    // curl -X POST http://192.168.2.197:7979/channel -d 5C
    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] handleBrowseUri: ' + curUri);
    if (curUri.startsWith(self.serviceName)) {
        response = self.listRoot(curUri);
        if (curUri == self.serviceName) {
        } else if (curUri.startsWith('welle_io/channel/')) {
            var selectedChannel = curUri.split('/')[2];
            self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] handleBrowseUri: selected channel ' + selectedChannel);
        } else {
            self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] handleBrowseUri: unhandled uri');
        }
    }
    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] handleBrowseUri - response: ' + response);
    defer.resolve(response);

    return defer.promise
        .fail(function (e) {
            self.logger.info('[' + Date.now() + '] ' + '[welle_io] handleBrowseUri failed');
            libQ.reject(new Error());
        });
};

ControllerWelle.prototype.listRoot = function () {
    var self = this;
    return {
        'navigation': {
            'lists': [
                {
                    'availableListViews': [
                        'list'
                    ],
                    'items': [
                        {
                            service: self.serviceName,
                            type: 'mywebradio',
                            title: 'Radio Bob!',
                            artist: '',
                            album: '',
                            icon: 'fa fa-music',
                            uri: 'welle_io/channel/1',
                            url: 'http://192.168.2.197:7979/mp3/0x15dd'
                        },
                        {
                            service: self.serviceName,
                            type: 'mywebradio',
                            title: 'Rock Antenne',
                            artist: '',
                            album: '',
                            icon: 'fa fa-music',
                            uri: 'welle_io/channel/2',
                            url: 'http://192.168.2.197:7979/mp3/0x15dd'
                        }
                    ]
                }
            ],
            'prev': {
                'uri': '/'
            }
        }
    }
};

// Define a method to clear, add, and play an array of tracks
ControllerWelle.prototype.clearAddPlayTrack = function (track) {
    var self = this;
    var defer = libQ.defer();

    return self.mpdPlugin.sendMpdCommand('stop', [])
        .then(function () {
            return self.mpdPlugin.sendMpdCommand('clear', []);
        })
        /*/.then(function () {
            return self.mpdPlugin.sendMpdCommand('consume 1', []);
        })*/
        /*.then(function () {
            return self.mpdPlugin.sendMpdCommand('load "' + track.uri + '"', []);
        })*/
        .then(function () {
            self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] set to consume mode, adding url: ' + track.uri);
            return self.mpdPlugin.sendMpdCommand('add "' + track.uri + '"', []);
        })
        .then(function () {
            self.commandRouter.pushToastMessage('info',
                self.getRadioI18nString('PLUGIN_NAME'),
                self.getRadioI18nString('WAIT_FOR_RADIO_CHANNEL'));
            self.commandRouter.stateMachine.setConsumeUpdateService('mpd');
            return self.mpdPlugin.sendMpdCommand('play', []).then(function () {
                return self.mpdPlugin.getState().then(function (state) {
                    return self.commandRouter.stateMachine.syncState(state, self.serviceName);
                });
            });
        })
        /*.then(function () {
            return self.setMetadata(metadataUrl);
        })*/
        .fail(function (e) {
            return libQ.reject(new Error());
        });
};

ControllerWelle.prototype.seek = function (timepos) {
    this.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerWelle::seek to ' + timepos);

    return this.sendSpopCommand('seek ' + timepos, []);
};

// Stop
ControllerWelle.prototype.stop = function () {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerWelle::stop');

    return self.mpdPlugin.stop().then(function () {
        return self.mpdPlugin.getState().then(function (state) {
            return self.commandRouter.stateMachine.syncState(state, self.serviceName);
        });
    });
};

// Spop pause
ControllerWelle.prototype.pause = function () {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerWelle::pause');

    return self.mpdPlugin.pause().then(function () {
        return self.mpdPlugin.getState().then(function (state) {
            return self.commandRouter.stateMachine.syncState(state, self.serviceName);
        });
    });
};

// Get state
ControllerWelle.prototype.getState = function () {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerWelle::getState');


};

//Parse state
ControllerWelle.prototype.parseState = function (sState) {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerWelle::parseState');

    //Use this method to parse the state and eventually send it with the following function
};

// Announce updated State
ControllerWelle.prototype.pushState = function (state) {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'ControllerWelle::pushState');

    return self.commandRouter.servicePushState(state, self.servicename);
};


ControllerWelle.prototype.explodeUri = function (uri) {
    var self = this;
    var defer = libQ.defer();

    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] explodeUri: ' + uri);
    var selectedChannel = uri.split('/')[2];
    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] explodeUri: selected channel ' + selectedChannel);
    var channels = self.listRoot().navigation.lists[0].items;
    var channel = channels[selectedChannel - 1];
    self.logger.info('[' + Date.now() + '] ' + '[ControllerWelle] explodeUri: playing channel ' + channel.title);
    defer.resolve({
        uri: channel.url,
        service: self.serviceName,
        name: channel.title,
        trackType: self.serviceName,
        type: 'track'
    });

    return defer.promise;
};

ControllerWelle.prototype.getAlbumArt = function (data, path) {

    var artist, album;

    if (data != undefined && data.path != undefined) {
        path = data.path;
    }

    var web;

    if (data != undefined && data.artist != undefined) {
        artist = data.artist;
        if (data.album != undefined)
            album = data.album;
        else album = data.artist;

        web = '?web=' + nodetools.urlEncode(artist) + '/' + nodetools.urlEncode(album) + '/large'
    }

    var url = '/albumart';

    if (web != undefined)
        url = url + web;

    if (web != undefined && path != undefined)
        url = url + '&';
    else if (path != undefined)
        url = url + '?';

    if (path != undefined)
        url = url + 'path=' + nodetools.urlEncode(path);

    return url;
};


ControllerWelle.prototype.loadRadioI18nStrings = function () {
    var self = this;
    self.i18nStrings = fs.readJsonSync(__dirname + '/i18n/strings_en.json');
    self.i18nStringsDefaults = fs.readJsonSync(__dirname + '/i18n/strings_en.json');
};

ControllerWelle.prototype.getRadioI18nString = function (key) {
    var self = this;

    if (self.i18nStrings[key] !== undefined)
        return self.i18nStrings[key];
    else
        return self.i18nStringsDefaults[key];
};


ControllerWelle.prototype.search = function (query) {
    var self = this;
    var defer = libQ.defer();

    // Mandatory, search. You can divide the search in sections using following functions

    return defer.promise;
};

ControllerWelle.prototype._searchArtists = function (results) {

};

ControllerWelle.prototype._searchAlbums = function (results) {

};

ControllerWelle.prototype._searchPlaylists = function (results) {


};

ControllerWelle.prototype._searchTracks = function (results) {

};

ControllerWelle.prototype.goto = function (data) {
    var self = this
    var defer = libQ.defer()

    // Handle go to artist and go to album function

    return defer.promise;
};
