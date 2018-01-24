/**
Gest the meta[name="elementrem-dapp-url-bar-style"] meta tag

@module getMetaTags
*/

const { ipcRenderer } = require('electron');

module.export = (function () {
    document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);

    function DOMContentLoaded(event) {
        const appBar = document.querySelector('meta[name="elementrem-dapp-url-bar-style"]');

        if (appBar) {
            ipcRenderer.sendToHost('appBar', appBar.content);
        } else {
            ipcRenderer.sendToHost('appBar', null);
        }

        document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
    }
}());
