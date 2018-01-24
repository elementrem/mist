/**
The init function of Mist

@method mistInit
*/
mistInit = function () {
    console.info('Initialise Mist Interface');

    EleBlocks.init();
    const eleBlocksInterval = setInterval(() => {
        if (_.isEmpty(EleBlocks.latest)) {
            EleBlocks.init();
        } else {
            clearInterval(eleBlocksInterval);
        }
    }, 500);

    Tabs.onceSynced.then(function () {
        if (location.search.indexOf('reset-tabs') >= 0) {
            console.info('Resetting UI tabs');

            Tabs.remove({});
        }

        if (!Tabs.findOne('browser')) {
            console.debug('Insert tabs');

            Tabs.insert({
                _id: 'browser',
                url: 'https://elementrem.org',
                redirect: 'https://elementrem.org',
                position: 0
            });
        } else {
            Tabs.upsert(
                { _id: 'browser' },
                {
                    $set: { position: 0 }
                }
            );
        }

        // overwrite wallet on start again, but use $set to dont remove titles
        Tabs.upsert(
            { _id: 'wallet' },
            {
                $set: {
                    url: 'https://wallet.elementrem.org',
                    redirect: 'https://wallet.elementrem.org',
                    position: 1,
                    permissions: {
                        admin: true
                    }
                }
            });

        // Sets browser as default tab if:
        // 1) there's no record of selected tab
        // 2) data is corrupted (no saved tab matches localstore)
        if (!LocalStore.get('selectedTab') || !Tabs.findOne(LocalStore.get('selectedTab'))) {
            LocalStore.set('selectedTab', 'wallet');
        }
    });
};


Meteor.startup(function () {
    console.info('Meteor starting up...');

    if (!location.hash) {  // Main window
        EleAccounts.init();
        mistInit();
    }

    console.debug('Setting language');

    TAPi18n.setLanguage(ipc.sendSync('backendAction_getLanguage'));

    // change moment and numeral language, when language changes
    Tracker.autorun(function () {
        if (_.isString(TAPi18n.getLanguage())) {
            const lang = TAPi18n.getLanguage().substr(0, 2);
            moment.locale(lang);
            try {
                numeral.language(lang);
            } catch (err) {
                console.warn(`numeral.js couldn't set number formating: ${err.message}`);
            }
            EleTools.setLocale(lang);
        }
    });
});
