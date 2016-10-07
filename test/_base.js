"use strict";

require('co-mocha');

const _ = require('underscore');
const genomatic = require('genomatic');
const Q = require('bluebird');
const fs = require('fs');
const Web3 = require('web3');
const shell = require('shelljs');
const path = require('path');
const packageJson = require('../package.json');
const Application = require('spectron').Application;

const chai = require('chai');
chai.should();

process.env.TEST_MODE = 'true';


exports.mocha = function(_module, options) {
  const tests = {};

  options = _.extend({
    app: 'mist'
  }, options);

  _module.exports[options.name || path.basename(_module.filename)] = {
    before: function*() {
      this.timeout(10000000);

      this.assert = chai.assert;
      this.expect = chai.expect;

      const logFilePath = path.join(__dirname, 'mist.log');
      shell.rm('-rf', logFilePath);

      const appFileName = ('wallet' === options.app) ? 'Elementrem-Wallet' : 'Mist',
        appVers = packageJson.version.replace(/\./ig, '-'),
        platformArch = `${process.platform}-${process.arch}`;

      let appPath, gelePath;

      switch (platformArch) {
        case 'darwin-x64':
          appPath = path.join(
            process.cwd(), 
            `dist_${options.app}`, 
            `${appFileName}-macosx-${appVers}`,
            `${appFileName}.app`,
            'Contents',
            'MacOS',
            appFileName
          );
          break;
        case 'linux-x64':
          appPath = path.join(
            process.cwd(), 
            `dist_${options.app}`, 
            `${appFileName}-linux64-${appVers}`,
            appFileName
          );
          break;
        default:
          throw new Error(`Cannot run tests on ${platformArch}, please run on: darwin-x64, linux-x64`)
      }

      // check that appPath exists
      if (!shell.test('-f', appPath)) {
        throw new Error('Cannot find binary: ' + appPath);
      }

      yield this.gele.start();

      this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:58545"));


      this.app = new Application({
        requireName: 'electronRequire',
        startTimeout: 5000,
        waitTimeout: 5000,
        quitTimeout: 10000,
        path: appPath,
        args: [
          '--mode', options.app, 
          '--loglevel', 'debug', 
          '--logfile', logFilePath, 
          '--node-datadir', this.gele.dataDir,
          '--ipcpath', path.join(this.gele.dataDir, 'gele.ipc')
        ],
      });

      yield this.app.start();

      this.client = this.app.client;

      yield this.client.waitUntilWindowLoaded();

      // wait a small amount of time to ensure main app window is ready with data
      yield Q.delay(8000);

      // console.log(this.app.chromeDriver.logLines);

      /*
      Utility methods
       */
      for (let key in Utils) {
        this[key] = genomatic.bind(Utils[key], this);
      }

      this.mainWindowHandle = (yield this.client.windowHandle()).value;
    },

    after: function*() {
      if (this.app && this.app.isRunning()) {
        yield this.app.stop();
      }

      if (this.gele && this.gele.isRunning) {
        yield this.gele.stop();
      }
    },

    tests: tests,
  };

  return tests;
};



const Utils = {
  waitUntil: function*(msg, promiseFn) {
    yield this.client.waitUntil(promiseFn, 
      10000, 
      msg, 
      500);
  },
  getUiElemens: function*(selector) {
    const elems = yield this.client.elemens(selector);     

    return elems.value;
  },
  getUiElemen: function*(selector) {
    const elem = yield this.client.elemen(selector);     

    return elem.value;
  },
  openAndFocusNewWindow: function*(fnPromise) {
    const client = this.client;

    const existingHandles = (yield client.windowHandles()).value;

    yield fnPromise();
    
    yield this.waitUntil('new window visible', function checkForAddWindow() {
      return client.windowHandles().then((handles) => {
        return handles.value.length === existingHandles.length + 1;
      });
    });

    const newHandles = (yield client.windowHandles()).value;

    // focus on new window
    yield client.window(newHandles.pop());
  },
  execElemsMethod: function*(clientElemenIdMethod, selector) {
    const elems = yield this.client.elemens(selector);

    const values = yield elems.value.map(
      (e) => this.client[clientElemenIdMethod](e.ELEMEN)
    );

    return values.map(r => r.value);
  },
  execElemMethod: function*(clientElemenIdMethod, selector) {
    const e = yield this.client.elemen(selector);

    console.log(e);

    const value = yield this.client[clientElemenIdMethod](e.ELEMEN);

    return value.value;
  },
  capturePage: function*() {
    let pageImage = yield this.app.browserWindow.capturePage();

    if (!pageImage) {
      throw new Error('Page capture failed');
    }

    fs.writeFileSync(path.join(__dirname, 'mist.png'), pageImage);
  },
  getRealAccountBalances: function*() {
    let accounts = this.web3.ele.accounts;

    let balances = accounts.map((acc) => 
      this.web3.fromMey(this.web3.ele.getBalance(acc), 'element') + ''
    );

    accounts = accounts.map(a => a.toLowerCase());
    balances = balances.map(b => parseInt(b));

    return _.object(accounts, balances);
  },
  getUiAccountBalances: function*() {
    // check balances on the pgetUiAccountsBalancesage
    let _accounts = yield this.execElemsMethod('elemenIdText', '.wallet-box .account-id');
    let _balances = yield this.execElemsMethod('elemenIdText', '.wallet-box .account-balance');

    _accounts = _accounts.map(a => a.toLowerCase());
    _balances = _balances.map(b => parseInt(b));

    return _.object(_accounts, _balances);
  },
  openAccountInUi: function*(accId) {
    let _accounts = yield this.execElemsMethod('elemenIdText', '.wallet-box .account-id');

    let idx = -1;

    accId = accId.toLowerCase();

    for (let i in _accounts) {
      if (_accounts[i].toLowerCase() === accId) {
        idx = i;
      }
    }

    if (0 > idx) {
      throw new Error('Unable to find account in UI');
    }

    const accLinks = yield this.client.elemens('.wallet-box');

    yield this.client.elementIdClick(accLinks.value[idx].ELEMENT);

    yield Q.delay(1000);
  },
  startMining: function*() {
    yield this.gele.consoleExec('miner.start();');
  },
  stopMining: function*() {
    yield this.gele.consoleExec('miner.stop();');
  },
}


