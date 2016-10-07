const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const MenuItem = electron.MenuItem;
const Menu = electron.Menu;
const shell = electron.shell;
const log = require('./utils/logger').create('menuItems');
const ipc = electron.ipcMain;
const elementremNode = require('./elementremNode.js');
const Windows = require('./windows');
const updateChecker = require('./updateChecker');
const Settings = require('./settings');
const fs = require('fs');
const dialog = electron.dialog;


// Make easier to return values for specific systems
var switchForSystem = function(options){
    if (process.platform in options) {
        return options[process.platform];
    }
    else if ('default' in options) {
        return options['default'];
    }
};


// create menu
// null -> null
var createMenu = function(webviews) {
    webviews = webviews || [];

    const menu = Menu.buildFromTemplate(menuTempl(webviews));
    Menu.setApplicationMenu(menu);
};


const restartNode = function(newType, newNetwork) {
    newNetwork = newNetwork || elementremNode.network;

    log.info('Switch node', newType, newNetwork);

    return elementremNode.restart(newType, newNetwork)
        .then(() => {
            Windows.getByType('main').load(global.interfaceAppUrl);

            createMenu(webviews);
        })
        .catch((err) => {
            log.error('Error switching node', err);
        });
};



// create a menu template
// null -> obj
var menuTempl = function(webviews) {
    const menu = []
    webviews = webviews || [];

    // APP
    menu.push({
        label: i18n.t('mist.applicationMenu.app.label', {app: Settings.appName}),
        submenu: [
            {
                label: i18n.t('mist.applicationMenu.app.about', {app: Settings.appName}),
                click: function(){
                    Windows.createPopup('about', {
                        electronOptions: {
                            width: 420,
                            height: 230,
                            alwaysOnTop: true,
                        }
                    });
                }
            },
            {
                label: i18n.t('mist.applicationMenu.app.checkForUpdates'),
                click: function() {
                    updateChecker.runVisibly();
                }
            },            {
                type: 'separator'
            },
            {
                label: i18n.t('mist.applicationMenu.app.services', {app: Settings.appName}),
                role: 'services',
                submenu: []
            },
            {
                type: 'separator'
            },
            {
                label: i18n.t('mist.applicationMenu.app.hide', {app: Settings.appName}),
                accelerator: 'Command+H',
                role: 'hide'
            },
            {
                label: i18n.t('mist.applicationMenu.app.hideOthers', {app: Settings.appName}),
                accelerator: 'Command+Alt+H',
                role: 'hideothers'
            },
            {
                label: i18n.t('mist.applicationMenu.app.showAll', {app: Settings.appName}),
                role: 'unhide'
            },
            {
                type: 'separator'
            },
            {
                label: i18n.t('mist.applicationMenu.app.quit', {app: Settings.appName}),
                accelerator: 'CommandOrControl+Q',
                click: function(){
                    app.quit();
                }
            }
        ]
    });

    // ACCOUNTS
    menu.push({
        label: i18n.t('mist.applicationMenu.accounts.label'),
        submenu: [
            {
                label: i18n.t('mist.applicationMenu.accounts.newAccount'),
                accelerator: 'CommandOrControl+N',
                click: function(){
                    Windows.createPopup('requestAccount', {
                        electronOptions: {
                            width: 420, height: 230, alwaysOnTop: true
                        }
                    });
                }
            },
            {
                type: 'separator'
            },
            {
                label: i18n.t('mist.applicationMenu.accounts.backup'),
                submenu: [
                    {
                        label: i18n.t('mist.applicationMenu.accounts.backupKeyStore'),
                        click: function(){
                            var path = Settings.userHomePath;

                            // ele
                            if(elementremNode.isEle) {
                                if(process.platform === 'win32')
                                    path = Settings.appDataPath + '\\Web3\\keys';
                                else
                                    path += '/.web3/keys';

                            // gele
                            } else {
                                if(process.platform === 'darwin')
                                    path += '/Library/Elementrem/keystore';

                                if(process.platform === 'freebsd' ||
                                   process.platform === 'linux' ||
                                   process.platform === 'sunos')
                                    path += '/.elementrem/keystore';

                                if(process.platform === 'win32')
                                    path = Settings.appDataPath + '\\Elementrem\\keystore';
                            }

                            shell.showItemInFolder(path);
                        }
                    },{
                        label: i18n.t('mist.applicationMenu.accounts.backupMist'),
                        click: function(){
                            shell.showItemInFolder(Settings.userDataPath);
                        }
                    }
                ]
            }
        ]
    });

    // EDIT
    menu.push({
        label: i18n.t('mist.applicationMenu.edit.label'),
        submenu: [
            {
                label: i18n.t('mist.applicationMenu.edit.undo'),
                accelerator: 'CommandOrControl+Z',
                role: 'undo'
            },
            {
                label: i18n.t('mist.applicationMenu.edit.redo'),
                accelerator: 'Shift+CommandOrControl+Z',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: i18n.t('mist.applicationMenu.edit.cut'),
                accelerator: 'CommandOrControl+X',
                role: 'cut'
            },
            {
                label: i18n.t('mist.applicationMenu.edit.copy'),
                accelerator: 'CommandOrControl+C',
                role: 'copy'
            },
            {
                label: i18n.t('mist.applicationMenu.edit.paste'),
                accelerator: 'CommandOrControl+V',
                role: 'paste'
            },
            {
                label: i18n.t('mist.applicationMenu.edit.selectAll'),
                accelerator: 'CommandOrControl+A',
                role: 'selectall'
            },
        ]
    })

    let genSwitchLanguageFunc = (lang_code) => function(menuItem, browserWindow){
        browserWindow.webContents.executeJavaScript(
            `TAPi18n.setLanguage("${lang_code}");`
        );
        ipc.emit("backendAction_setLanguage", {}, lang_code);
    }
    let currentLanguage = i18n.getBestMatchedLangCode(global.language);

    let languageMenu =
    Object.keys(i18n.options.resources)
    .filter(lang_code => lang_code != 'dev')
    .map(lang_code => {
        menuItem = {
            label: i18n.t('mist.applicationMenu.view.langCodes.' + lang_code),
            type: 'checkbox',
            checked: (currentLanguage === lang_code),
            click: genSwitchLanguageFunc(lang_code)
        }
        return menuItem
    });
    let defaultLang = i18n.getBestMatchedLangCode(app.getLocale());
    languageMenu.unshift({
        label:  i18n.t('mist.applicationMenu.view.default'),
        click: genSwitchLanguageFunc(defaultLang)
    }, {
        type: 'separator'
    });

    // VIEW
    menu.push({
        label: i18n.t('mist.applicationMenu.view.label'),
        submenu: [
            {
                label: i18n.t('mist.applicationMenu.view.fullscreen'),
                accelerator: switchForSystem({
                    'darwin': 'Command+Control+F',
                    'default': 'F11'
                }),
                click: function(){
                    let mainWindow = Windows.getByType('main');

                    mainWindow.window.setFullScreen(!mainWindow.window.isFullScreen());
                }
            },
            {
                label: i18n.t('mist.applicationMenu.view.languages'),
                submenu: languageMenu
            }
        ]
    })

    // DEVELOP
    var devToolsMenu = [];

    // change for wallet
    if(Settings.uiMode === 'mist') {
        devtToolsSubMenu = [{
            label: i18n.t('mist.applicationMenu.develop.devToolsMistUI'),
            accelerator: 'Alt+CommandOrControl+I',
            click: function() {
                if(curWindow = BrowserWindow.getFocusedWindow())
                    curWindow.toggleDevTools();
            }
        },{
            type: 'separator'
        }];

        // add webviews
        webviews.forEach(function(webview){
            devtToolsSubMenu.push({
                label: i18n.t('mist.applicationMenu.develop.devToolsWebview', {webview: webview.name}),
                click: function() {
                    Windows.getByType('main').send('toggleWebviewDevTool', webview._id);
                }
            });
        });

    // wallet
    } else {
        devtToolsSubMenu = [{
            label: i18n.t('mist.applicationMenu.develop.devToolsWalletUI'),
            accelerator: 'Alt+CommandOrControl+I',
            click: function() {
                if(curWindow = BrowserWindow.getFocusedWindow())
                    curWindow.toggleDevTools();
            }
        }];
    }

    devToolsMenu = [{
            label: i18n.t('mist.applicationMenu.develop.devTools'),
            submenu: devtToolsSubMenu
        },{
            label: i18n.t('mist.applicationMenu.develop.runTests'),
            enabled: (Settings.uiMode === 'mist'),
            click: function(){
                Windows.getByType('main').send('runTests', 'webview');
            }
        },{
            label: i18n.t('mist.applicationMenu.develop.logFiles'),
            click: function(){
                var log = '';
                try {
                    log = fs.readFileSync(Settings.userDataPath + '/node.log', {encoding: 'utf8'});
                    log = '...'+ log.slice(-1000);
                } catch(e){
                    log.info(e);
                    log = 'Couldn\'t load log file.';
                };

                dialog.showMessageBox({
                    type: "info",
                    buttons: ['OK'],
                    message: 'Node log file',
                    detail: log
                }, function(){
                });
            }
        }
    ];

    // add node switching menu
    devToolsMenu.push({
        type: 'separator'
    });
    // add node switch
    if(process.platform === 'darwin' || process.platform === 'win32') {
        devToolsMenu.push({
            label: i18n.t('mist.applicationMenu.develop.elementremNode'),
            submenu: [
              {
                label: 'Gele 1.4.16 (Go)',
                checked: elementremNode.isOwnNode && elementremNode.isGele,
                enabled: elementremNode.isOwnNode,
                type: 'checkbox',
                click: function(){
                    restartNode('gele');
                }
              }
        ]});
    }

    menu.push({
        label: ((global.mining) ? '⛏ ' : '') + i18n.t('mist.applicationMenu.develop.label'),
        submenu: devToolsMenu
    })

    // WINDOW
    menu.push({
        label: i18n.t('mist.applicationMenu.window.label'),
        role: 'window',
        submenu: [
            {
                label: i18n.t('mist.applicationMenu.window.minimize'),
                accelerator: 'CommandOrControl+M',
                role: 'minimize'
            },
            {
                label: i18n.t('mist.applicationMenu.window.close'),
                accelerator: 'CommandOrControl+W',
                role: 'close'
            },
            {
                type: 'separator'
            },
            {
                label: i18n.t('mist.applicationMenu.window.toFront'),
                role: 'arrangeInFront:',
                role: 'front'
            },
        ]
    })

    return menu;
};

module.exports = createMenu;
