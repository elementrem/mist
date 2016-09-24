###To build from source	

***As a general rule, Do not lose your password and keystore and Mist stores file. In any case, recovery is impossible.***
***And it doesn't collect any personally identifiable information.***

-------------------------------------------
###Prerequisite:

Don't expect that you can build app for all platforms on one platform.
- If your app has native dependencies, it can be compiled only on the target platform. prebuild is a solution, but most node modules don't provide prebuilt binaries.
- OS Code Signing works only on MacOS. Cannot be fixed.
- Elementrem Mist provides support for 64-bit only.

***To create a binaries you need to install [electron-builder dependencies](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#macos)***

--------------------------
###e.g - To create a binaries on Linux

`sudo apt-get install -y git unzip`   

* [Curl](https://curl.haxx.se/)  	 	
`sudo apt-get install curl`   
* [Node.js](https://nodejs.org/)    
`curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -`  
`sudo apt-get install -y nodejs`   
* [Meteor](https://www.meteor.com/)   
`curl https://install.meteor.com/ | sh`   
* [Meteor Build Client](https://github.com/frozeman/meteor-build-client/) 	  
`sudo npm install -g meteor-build-client`    
* [Electron](http://electron.atom.io/)        
`sudo npm install -g electron-prebuilt@1.3.5`   
* [Gulp](http://gulpjs.com/)    
`sudo npm install -g gulp`  
* [Ruby](https://www.ruby-lang.org/)    
`sudo apt-get install ruby-full`
* [Brew](http://linuxbrew.sh/)      
```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install)" 
export PATH="$HOME/.linuxbrew/bin:$PATH" 
export MANPATH="$HOME/.linuxbrew/share/man:$MANPATH" 
export INFOPATH="$HOME/.linuxbrew/share/info:$INFOPATH" 
source ~/.bashrc
brew update 
brew install hello
```

####Tools for the Linux binaries     
`brew install gnu-tar libicns graphicsmagick xz`

####Tools for the Win binaries
* [Wine](https://www.winehq.org/)   
```
sudo add-apt-repository ppa:wine/wine-builds 
sudo apt update
brew install Caskroom/cask/xquartz 
brew install wine
brew install mono
sudo apt-get install --install-recommends winehq-devel 
```

####Create a binaries

```
$ git clone https://github.com/elementrem/mist
$ cd mist   
```
When you run `npm install`, You can see several errors related to the macos. But don't worry. osx dependencies works only on MacOS. This is not related to Linux.
```
$ npm install
//Download nodes
$ gulp update-nodes
```
```
// to generate mist   
$ gulp mist --platform "<OS>"   
// to generate mist-wallet
$ gulp wallet --platform "<OS>"
```
OS Options are:    
* `mac`   
* `win`		
* `linux`

It expects binaries files to be in the generated folders e.g.
`dist_mist`
`dist_wallet`

---------------------------------------------------

Other OS, please refer to the [electron-builder dependencies](https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build#macos)