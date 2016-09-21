### To build from source	

***As a general rule, Do not lose your password and keystore file. In any case, recovery is impossible.***
***And it doesn't collect any personally identifiable information.***

**Prerequisite**    
`sudo apt-get install unzip build-essential git m4 ruby texinfo libbz2-dev libcurl4-openssl-dev libexpat-dev libncurses-dev zlib1g-dev gcc-multilib g++-multilib`   

* [Curl](https://curl.haxx.se/)   
Ubuntu, for instance	
`sudo apt-get install curl`   
* [Node.js](https://nodejs.org/)    
Ubuntu, for instance    
`curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`  
`sudo apt-get install -y nodejs`   
`sudo npm install npm -g`      
`sudo apt install node-gyp`
* [Meteor](https://www.meteor.com/)   
Ubuntu, for instance `curl https://install.meteor.com/ | sh`   
* [Meteor Build Client](https://github.com/frozeman/meteor-build-client/)   
Ubuntu, for instance `sudo npm install -g meteor-build-client`    
* [Electron](http://electron.atom.io/)    
Ubuntu, for instance    
`sudo npm install -g electron-prebuilt@1.2.5`   
`sudo npm install -g electron-packager`    
* [Gulp](http://gulpjs.com/)    
Ubuntu, for instance `sudo npm install -g gulp`  
* [Ruby](https://www.ruby-lang.org/)    
Ubuntu, for instance `sudo apt-get install ruby-full`
* [Brew](http://linuxbrew.sh/)    
Ubuntu, for instance    
`ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install)"`    
`export PATH="$HOME/.linuxbrew/bin:$PATH"`    
`export MANPATH="$HOME/.linuxbrew/share/man:$MANPATH"`    
`export INFOPATH="$HOME/.linuxbrew/share/info:$INFOPATH"`   
`source ~/.bashrc`    
`brew install Caskroom/cask/xquartz`    
`brew update`   
* [Wine](https://www.winehq.org/)   
Ubuntu, for instance    
`sudo add-apt-repository ppa:wine/wine-builds`    
`brew install wine`   
`sudo apt-get update`     
`sudo apt-get upgrade`    
`sudo apt-get install --install-recommends winehq-devel`    

- Elementrem Mist provides support for 64-bit only.

**build**   
```bash
cd mist   
npm install
// to generate mist   
gulp mist   
// Or generate mist-wallet
gulp wallet
```
**platform**    
Additional you can only build the windows, linux or mac binary by using the platform option:    
`gulp mist --platform "<OS>"`   
`gulp wallet --platform "<OS>"`   
<OS>Options are:    
* `darwin` (Mac)    
* `win32` (Windows)   
* `linux`  (Linux)    
