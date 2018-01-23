

const _ = global._;
const BaseProcessor = require('./base');
const db = require('../../db');

/**
 * Process method: ele_accounts
 */
module.exports = class extends BaseProcessor {
    /**
     * @override
     */
    sanitizeResponsePayload(conn, payload, isPartOfABatch) {
        this._log.trace('Sanitize ele_acconts', payload.result);

        // if not an admin connection then do a check
        if (!this._isAdminConnection(conn)) {
            const tab = db.getCollection('UI_tabs').findOne({ webviewId: conn.id });

            if (_.get(tab, 'permissions.accounts')) {
                payload.result = _.intersection(payload.result, tab.permissions.accounts);
            } else {
                payload.result = [];
            }
        }

        return super.sanitizeResponsePayload(conn, payload, isPartOfABatch);
    }
};

