/**
Window communication

@module ipcCommunicator
*/

const _ = global._;
const fs = require('fs');
const { app, ipcMain: ipc, shell, webContents } = require('electron');
const Windows = require('./windows');
const logger = require('./utils/logger');
const appMenu = require('./menuItems');
const Settings = require('./settings');
const elementremNode = require('./elementremNode.js');
const keyfileRecognizer = require('elementrem-keyfile-recognizer');

const log = logger.create('ipcCommunicator');

require('./abi.js');
/*

// windows including webviews
windows = {
    23: {
        type: 'requestWindow',
        window: obj,
        owner: 12
    },
    12: {
        type: 'webview'
        window: obj
        owner: null
    }
}

*/

// UI ACTIONS
ipc.on('backendAction_closeApp', () => {
    app.quit();
});

ipc.on('backendAction_openExternalUrl', (e, url) => {
    shell.openExternal(url);
});

ipc.on('backendAction_closePopupWindow', (e) => {
    const windowId = e.sender.id;
    const senderWindow = Windows.getById(windowId);

    if (senderWindow) {
        senderWindow.close();
    }
});
ipc.on('backendAction_setWindowSize', (e, width, height) => {
    const windowId = e.sender.id;
    const senderWindow = Windows.getById(windowId);

    if (senderWindow) {
        senderWindow.window.setSize(width, height);
        senderWindow.window.center(); // ?
    }
});

ipc.on('backendAction_windowCallback', (e, value1, value2, value3) => {
    const windowId = e.sender.id;
    const senderWindow = Windows.getById(windowId);

    if (senderWindow.callback) {
        senderWindow.callback(value1, value2, value3);
    }
});

ipc.on('backendAction_windowMessageToOwner', (e, error, value) => {
    const windowId = e.sender.id;
    const senderWindow = Windows.getById(windowId);

    if (senderWindow.ownerId) {
        const ownerWindow = Windows.getById(senderWindow.ownerId);
        const mainWindow = Windows.getByType('main');

        if (ownerWindow) {
            ownerWindow.send('uiAction_windowMessage', senderWindow.type, error, value);
        }

        // send through the mainWindow to the webviews
        if (mainWindow) {
            mainWindow.send('uiAction_windowMessage', senderWindow.type, senderWindow.ownerId, error, value);
        }
    }
});

ipc.on('backendAction_setLanguage', (e) => {
    global.i18n.changeLanguage(Settings.language.substr(0, 5), (err) => {
        if (!err) {
            log.info('Backend language set to: ', global.i18n.language);
            appMenu(global.webviews);
        }
    });
});

ipc.on('backendAction_getLanguage', (e) => {
    e.returnValue = Settings.language;
});

ipc.on('backendAction_stopWebviewNavigation', (e, id) => {
    console.log('webcontent ID', id);
    const webContent = webContents.fromId(id);

    if (webContent && !webContent.isDestroyed()) {
        webContent.stop();
    }

    e.returnValue = true;
});

// check wallet file
ipc.on('backendAction_checkWalletFile', (e, path) => {
    fs.readFile(path, 'utf8', (event, data) => {
        try {
            const keyfile = JSON.parse(data);
            const result = keyfileRecognizer(keyfile);
            /** result
            *  [ 'Elementsale', undefined ]   Elementsale keyfile
            *               [ 'web3', 3 ]   web3 (v3) keyfile
            *                        null   no valid  keyfile
            */

            const type = _.first(result);

            log.debug(`Importing ${type} account...`);

            if (type === 'Elementsale') {
                e.sender.send('uiAction_checkedWalletFile', null, 'presale');
            } else if (type === 'web3') {
                e.sender.send('uiAction_checkedWalletFile', null, 'web3');

                let keystorePath = Settings.userHomePath;
                // ele
                if (elementremNode.isEle) {
                    if (process.platform === 'win32') {
                        keystorePath = `${Settings.appDataPath}\\Web3\\keys`;
                    } else {
                        keystorePath += '/.web3/keys';
                    }
                // gele
                } else {
                    if (process.platform === 'darwin') keystorePath += '/Library/Elementrem/keystore';

                    if (process.platform === 'freebsd' ||
                        process.platform === 'linux' ||
                        process.platform === 'sunos') keystorePath += '/.elementrem/keystore';

                    if (process.platform === 'win32') keystorePath = `${Settings.appDataPath}\\Elementrem\\keystore`;
                }

                if (!/^[0-9a-fA-F]{40}$/.test(keyfile.address)) {
                    throw new Error('Invalid Address format.');
                }

                fs.writeFile(`${keystorePath}/0x${keyfile.address}`, data, (err) => {
                    if (err) throw new Error("Can't write file to disk");
                });
            } else {
                throw new Error('Account import: Cannot recognize keyfile (invalid)');
            }
        } catch (err) {
            e.sender.send('uiAction_checkedWalletFile', null, 'invalid');
            if (/Unexpected token . in JSON at position 0/.test(err.message) === true) {
                log.error('Account import: Cannot recognize keyfile (no JSON)');
            } else {
                log.error(err);
            }
        }
    });
});


// import presale wallet
ipc.on('backendAction_importWalletFile', (e, path, pw) => {
    const spawn = require('child_process').spawn;  // eslint-disable-line global-require
    const ClientBinaryManager = require('./clientBinaryManager');  // eslint-disable-line global-require
    let error = false;

    const binPath = ClientBinaryManager.getClient('gele').binPath;
    const nodeProcess = spawn(binPath, ['wallet', 'import', path]);

    nodeProcess.once('error', () => {
        error = true;
        e.sender.send('uiAction_importedWalletFile', 'Couldn\'t start the "gele wallet import <file.json>" process.');
    });
    nodeProcess.stdout.on('data', (_data) => {
        const data = _data.toString();
        if (data) {
            log.info('Imported presale: ', data);
        }

        if (/Decryption failed|not equal to expected addr|could not decrypt/.test(data)) {
            e.sender.send('uiAction_importedWalletFile', 'Decryption Failed');

            // if imported, return the address
        } else if (data.indexOf('Address:') !== -1) {
            const find = data.match(/\{([a-f0-9]+)\}/i);
            if (find.length && find[1]) {
                e.sender.send('uiAction_importedWalletFile', null, `0x${find[1]}`);
            } else {
                e.sender.send('uiAction_importedWalletFile', data);
            }

            // if not stop, so we don't kill the process
        } else {
            return;
        }

        nodeProcess.stdout.removeAllListeners('data');
        nodeProcess.removeAllListeners('error');
        nodeProcess.kill('SIGINT');
    });

    // file password
    setTimeout(() => {
        if (!error) {
            nodeProcess.stdin.write(`${pw}\n`);
            pw = null;  // eslint-disable-line no-param-reassign
        }
    }, 2000);
});


const createAccountPopup = (e) => {
    Windows.createPopup('requestAccount', {
        ownerId: e.sender.id,
        electronOptions: {
            width: 400,
            height: 230,
            alwaysOnTop: true,
        },
    });
};

// MIST API
ipc.on('mistAPI_createAccount', createAccountPopup);

ipc.on('mistAPI_requestAccount', (e) => {
    if (global.mode === 'wallet') {
        createAccountPopup(e);
    } else { // Mist
        Windows.createPopup('connectAccount', {
            ownerId: e.sender.id,
            electronOptions: {
                width: 460,
                height: 520,
                maximizable: false,
                minimizable: false,
                alwaysOnTop: true,
            },
        });
    }
});

const uiLoggers = {};

ipc.on('console_log', (event, id, logLevel, logItemsStr) => {
    try {
        const loggerId = `(ui: ${id})`;

        let windowLogger = uiLoggers[loggerId];

        if (!windowLogger) {
            windowLogger = uiLoggers[loggerId] = logger.create(loggerId);
        }

        windowLogger[logLevel](..._.toArray(JSON.parse(logItemsStr)));
    } catch (err) {
        log.error(err);
    }
});

ipc.on('backendAction_reloadSelectedTab', (event) => {
    event.sender.send('uiAction_reloadSelectedTab');
});
