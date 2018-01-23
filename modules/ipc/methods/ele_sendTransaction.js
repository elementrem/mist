

const BaseProcessor = require('./base');
const Windows = require('../../windows');
const Q = require('bluebird');
const { ipcMain: ipc } = require('electron');
const BlurOverlay = require('../../blurOverlay');

/**
 * Process method: ele_sendTransaction
 */
module.exports = class extends BaseProcessor {

    /**
     * @override
     */
    sanitizeRequestPayload(conn, payload, isPartOfABatch) {
        if (isPartOfABatch) {
            throw this.ERRORS.BATCH_TX_DENIED;
        }

        return super.sanitizeRequestPayload(conn, payload, isPartOfABatch);
    }


    /**
     * @override
     */
    exec(conn, payload) {
        return new Q((resolve, reject) => {
            this._log.info('Ask user for password');

            this._log.info(payload.params[0]);

            // validate data
            try {
                _.each(payload.params[0], (val, key) => {
                    // if doesn't have hex then leave
                    if (!_.isString(val)) {
                        throw this.ERRORS.INVALID_PAYLOAD;
                    } else {
                        // make sure all data is lowercase and has 0x
                        if (val) val = `0x${val.toLowerCase().replace(/^0x/, '')}`;

                        if (val.substr(2).match(/[^0-9a-f]/igm)) {
                            throw this.ERRORS.INVALID_PAYLOAD;
                        }
                    }

                    payload.params[0][key] = val;
                });
            } catch (err) {
                return reject(err);
            }

            const modalWindow = Windows.createPopup('sendTransactionConfirmation', {
                sendData: {
                    uiAction_sendData: payload.params[0],
                },
                electronOptions: {
                    width: 580,
                    height: 550,
                    alwaysOnTop: true,
                    enableLargerThanScreen: false,
                    resizable: true
                },
            });

            BlurOverlay.enable();

            modalWindow.on('closed', () => {
                BlurOverlay.disable();

                // user cancelled?
                if (!modalWindow.processed) {
                    reject(this.ERRORS.METHOD_DENIED);
                }
            });

            ipc.once('backendAction_unlockedAccountAndSentTransaction', (ev, err, result) => {
                if (Windows.getById(ev.sender.id) === modalWindow
                        && !modalWindow.isClosed) {
                    if (err || !result) {
                        this._log.debug('Confirmation error', err);

                        reject(err || this.ERRORS.METHOD_DENIED);
                    } else {
                        this._log.info('Transaction sent', result);

                        resolve(result);
                    }

                    modalWindow.processed = true;
                    modalWindow.close();
                }
            });
        })
        .then((result) => {
            return _.extend({}, payload, {
                result,
            });
        });
    }
};
