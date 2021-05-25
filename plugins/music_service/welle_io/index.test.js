const ControllerWelle = require('.');
//const sum = require('./ControllerWelle');
const logger = {
    info: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
};

// trying to mock createLogger to return a specific logger instance
/*jest.mock("winston", () => ({
    format: {
        colorize: jest.fn(),
        combine: jest.fn(),
        label: jest.fn(),
        timestamp: jest.fn(),
        printf: jest.fn()
    },
    createLogger: jest.fn().mockReturnValue(logger),
    transports: {
        Console: jest.fn()
    }
}));

import * as winston from "winston";
import { LoggingService } from "./logger.service";*/

test('explodeUri', () => {
    var context = {
        'logger': logger
    };
    var controller = new ControllerWelle(context);
    controller.explodeUri('welle_io/channel/1')
});
