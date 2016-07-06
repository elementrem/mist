const electron = require('electron');
var ipc = electron.ipcRenderer;

module.export = (function() {
    document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);

    function DOMContentLoaded(event) {
        var appBar = document.querySelector('meta[name="elementrem-dapp-url-bar-style"]');

        if(appBar)
            ipc.sendToHost('appBar', appBar.content);
        else
            ipc.sendToHost('appBar', null);

        document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
    }
})();