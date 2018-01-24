const _ = global._;
const BaseProcessor = require('./base');
const ele = require('elementremjs-util');

/**
 * Process method: ele_getTransactionReceipt
 */

module.exports = class extends BaseProcessor {

    sanitizeRequestPayload(conn, payload, isPartOfABatch) {
        return super.sanitizeRequestPayload(conn, payload, isPartOfABatch);
    }

    async exec(conn, payload) {
        const txHash = payload.params[0];

        // Sends regular ele_getTransactionReceipt request
        const ret = await conn.socket.send(payload, {
            fullResult: true
        });

        // If that contains a contractAddress already, fine.
        if (ret.result.result.contractAddress != null) {
            return ret.result;
        }

        // Due to a gele's light client v1 bug, it does not return
        // contractAddress value on the receipts. Let's fix that.
        // 1. GET TRANSACTION from AND nonce VALUES
        const transactionInfo = await conn.socket.send({
            jsonrpc: '2.0',
            id: _.uuid(),
            method: 'ele_getTransactionByHash',
            params: [txHash]
        }, { fullResult: true });


        const fromAddress = transactionInfo.result.result.from;
        const nonce = parseInt(transactionInfo.result.result.nonce, 16);
        const possibleContractAddress = `0x${ele.generateAddress(fromAddress, nonce).toString('hex')}`;


        // 2. GET CODE FROM ADDRESS
        const contractCode = await conn.socket.send({
            jsonrpc: '2.0',
            id: _.uuid(),
            method: 'ele_getCode',
            params: [possibleContractAddress, 'latest']
        }, { fullResult: true });
        const contractCodeResult = contractCode.result.result;

        // 3. IF IT EXISTS, ASSIGN TO RETURN VALUE
        if (contractCodeResult && contractCodeResult.length > 2) {
            ret.result.result.contractAddress = possibleContractAddress;
        }

        return ret.result;
    }
};
