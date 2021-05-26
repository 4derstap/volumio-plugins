const ControllerWelle = require('.');
//const sum = require('./ControllerWelle');
const logger = {
    info: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
};
const context = {
    'logger': logger
};

test('explodeUri', () => {
    var controller = new ControllerWelle(context);
    var result = controller.explodeUri('welle_io/channel/1');
    expect(result._isPromise).toBe(true);
    expect(result._data).toStrictEqual({
        uri: 'http://192.168.2.197:7979/mp3/0x15dd',
        name: 'Radio Bob!',
        service: 'welle_io',
        trackType: 'welle_io',
        type: 'track'
    });
});
