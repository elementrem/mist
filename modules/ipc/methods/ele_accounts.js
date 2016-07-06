"use strict";

const _ = global._;
const BaseProcessor = require('./base');


/**
 * Process method: ele_accounts
 */
module.exports = class extends BaseProcessor {
    /**
     * @override
     */
    exec (conn, payload) {
        return super.exec(conn, payload)
        .then((ret) => {
            this._log.trace('Got account list', ret.result);

            // if not an admin connection then do a check
            if (!this._isAdminConnection(conn)) {
                let tab = Tabs.findOne({ webviewId: conn.id });

                if(_.get(tab, 'permissions.accounts')) {
                    ret.result = _.intersection(ret.result, tab.permissions.accounts);
                } else {
                    ret.result = [];
                }                
            }                

            return ret;
        });
    }
}


