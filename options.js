'use strict';

var appoptions = {
    configName: '.jstail',
    colorActive: (process.platform === 'win32') ? false : true, // deactivate color by default on windows platform
    quiet: false,
    debug: false,
    config: null,
    logFile: null,
    setting: null,
    skey: 'mysecretkey@1986'
};

export const options = appoptions

