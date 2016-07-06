/**
Template Controllers

@module Templates
*/

/**
The networkIndicator template

@class [template] elemens_networkIndicator
@constructor
*/



/**
Check network type.

@method checkNetworkType
*/
var checkNetworkType = function(template) {
    console.trace('Check network type...');

    try {
        web3.ele.getBlock(0, function(e, res) {
            console.trace('Get block 0', e, res);
            
            if (e) {
                console.error('Got error fetching block 0', e);
            } else {
                
                switch (res.hash) {
                    case '0xc7130c992fb03c628c86439f8e5d1facdbf48f3f3c115ffd99a0e3abefa1016f':
                        console.log('network is mainnet')
                        TemplateVar.set(template, 'network', 'mainnet' );
                        break;

                    case '0xe6ee8ac9e0f92dab6034e71e9aa1abd3a1a13010ca44010b120391a4dd7c91d1':
                        console.log('network is testnet')
                        TemplateVar.set(template, 'network', 'testnet' );
                        break;
                    default:
                        console.log('network is privatenet')
                        TemplateVar.set(template, 'network', 'privatenet' );
                }                
            }
        });        
    } catch (err) {
        console.error('Unable to get block 0', err);
    }
};



Template['elemens_networkIndicator'].onRendered(function(){
    var template = this;

    TemplateVar.set(template, 'network', 'unknown');

    checkNetworkType(template);

    ipc.on('uiAction_nodeStatus', function(e, status) {
        console.trace('Node status', status);

        switch (status) {
            case 'starting':
            case 'stopping':
            case 'connected':
                console.debug('Node status changing, reset network type indicator');

                TemplateVar.set(template, 'network', 'unknown');
           
            break;
        }
    });

    ipc.on('uiAction_nodeSyncStatus', function(e, status, data) {
        console.trace('Node sync status', status);

        if ('inProgress' === status && TemplateVar.get(template, 'network')=='unknown') {
            console.debug('Node syncing, re-check network type.');

            checkNetworkType(template);            
        }
    });
});


