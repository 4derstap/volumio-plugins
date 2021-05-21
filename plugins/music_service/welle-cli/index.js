'use strict';

var libQ = require('kew');
var fs = require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;


module.exports = welle_cli;
function welle_cli(context) {
    var self = this;

    this.context = context;
    this.commandRouter = this.context.coreCommand;
    this.logger = this.context.logger;
    this.configManager = this.context.configManager;

}



welle_cli.prototype.onVolumioStart = function () {
    var self = this;
    var configFile = this.commandRouter.pluginManager.getConfigurationFile(this.context, 'config.json');
    this.config = new (require('v-conf'))();
    this.config.loadFile(configFile);

    return libQ.resolve();
}

welle_cli.prototype.onStart = function () {
    var self = this;
    var defer = libQ.defer();

    self.mpdPlugin = this.commandRouter.pluginManager.getPlugin('music_service', 'mpd');
    self.addToBrowseSources();

    // Once the Plugin has successfull started resolve the promise
    defer.resolve();

    return defer.promise;
};

welle_cli.prototype.onStop = function () {
    var self = this;
    var defer = libQ.defer();

    self.removeFromBrowseSources();

    // Once the Plugin has successfull stopped resolve the promise
    defer.resolve();

    return libQ.resolve();
};

welle_cli.prototype.onRestart = function () {
    var self = this;
    // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

welle_cli.prototype.getUIConfig = function () {
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

welle_cli.prototype.getConfigurationFiles = function () {
    return ['config.json'];
}

welle_cli.prototype.setUIConfig = function (data) {
    var self = this;
    //Perform your installation tasks here
};

welle_cli.prototype.getConf = function (varName) {
    var self = this;
    //Perform your installation tasks here
};

welle_cli.prototype.setConf = function (varName, varValue) {
    var self = this;
    //Perform your installation tasks here
};



// Playback Controls ---------------------------------------------------------------------------------------
// If your plugin is not a music_sevice don't use this part and delete it


welle_cli.prototype.addToBrowseSources = function () {

    // Use this function to add your music service plugin to music sources
    var data = {
        name: 'Welle.io DAB+ Radio',
        uri: 'welle_io',
        plugin_type: 'music_service',
        plugin_name: 'welle-cli',
        albumart: '/albumart?sourceicon=music_service/welle-cli/icon.png'
    };
    this.commandRouter.volumioAddToBrowseSources(data);
};

welle_cli.prototype.removeFromBrowseSources = function () {
    // Use this function to add your music service plugin to music sources
    var self = this;

    self.commandRouter.volumioRemoveToBrowseSources('Welle.io DAB+ Radio');
};

welle_cli.prototype.handleBrowseUri = function (curUri) {
    var self = this;
    var response;
    var defer = libQ.defer();

    //self.commandRouter.logger.info(curUri);
    // curl -X POST http://192.168.2.197:7979/channel -d 5C

    if (curUri.startsWith('welle_io')) {
        if (curUri == 'welle_io') {
            self.resetHistory();
            self.historyAdd(curUri);
            response = self.listRoot(curUri);
        } else { }
    }
    defer.resolve(response);

    return response
        .fail(function (e) {
            self.logger.info('[' + Date.now() + '] ' + '[welle-cli] handleBrowseUri failed');
            libQ.reject(new Error());
        });
};

welle_cli.prototype.listRoot = function () {
    var self = this;
    var defer = libQ.defer();

    var radioRoot = {
        'navigation': {
            'lists': [
                {
                    'availableListViews': [
                        'list'
                    ],
                    'items': [
                        {
                            service: 'welle_io',
                            type: 'dab-radio',
                            title: 'Radio Bob!',
                            artist: '',
                            album: '',
                            icon: 'fa fa-music',
                            uri: 'welle_io/channel/1',
                            url: 'http://192.168.2.197:7979/mp3/0x15dd'
                        },
                        {
                            service: 'welle_io',
                            type: 'dab-radio',
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
welle_cli.prototype.clearAddPlayTrack = function (track) {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'welle_cli::clearAddPlayTrack');

    self.commandRouter.logger.info(JSON.stringify(track));

    return self.sendSpopCommand('uplay', [track.uri]);
};

welle_cli.prototype.seek = function (timepos) {
    this.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'welle_cli::seek to ' + timepos);

    return this.sendSpopCommand('seek ' + timepos, []);
};

// Stop
welle_cli.prototype.stop = function () {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'welle_cli::stop');


};

// Spop pause
welle_cli.prototype.pause = function () {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'welle_cli::pause');


};

// Get state
welle_cli.prototype.getState = function () {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'welle_cli::getState');


};

//Parse state
welle_cli.prototype.parseState = function (sState) {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'welle_cli::parseState');

    //Use this method to parse the state and eventually send it with the following function
};

// Announce updated State
welle_cli.prototype.pushState = function (state) {
    var self = this;
    self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'welle_cli::pushState');

    return self.commandRouter.servicePushState(state, self.servicename);
};


welle_cli.prototype.explodeUri = function (uri) {
    var self = this;
    var defer = libQ.defer();

    // Mandatory: retrieve all info for a given URI

    return defer.promise;
};

welle_cli.prototype.getAlbumArt = function (data, path) {

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





welle_cli.prototype.search = function (query) {
    var self = this;
    var defer = libQ.defer();

    // Mandatory, search. You can divide the search in sections using following functions

    return defer.promise;
};

welle_cli.prototype._searchArtists = function (results) {

};

welle_cli.prototype._searchAlbums = function (results) {

};

welle_cli.prototype._searchPlaylists = function (results) {


};

welle_cli.prototype._searchTracks = function (results) {

};

welle_cli.prototype.goto = function (data) {
    var self = this
    var defer = libQ.defer()

    // Handle go to artist and go to album function

    return defer.promise;
};
