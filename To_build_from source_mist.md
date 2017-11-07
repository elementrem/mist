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
`sudo apt-get update`       
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
sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
$ nano ~/.profile
export PATH="$HOME/.linuxbrew/bin:$HOME/.linuxbrew/sbin:$PATH"
export PATH="/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:$PATH"
$ source ~/.profile
brew update 
brew install hello
brew install Caskroom/cask/xquartz 
```

####Tools for the Linux binaries     
`brew install gnu-tar libicns graphicsmagick xz`

####Tools for the Win binaries
* [mono](http://www.mono-project.com/)
```
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb http://download.mono-project.com/repo/ubuntu xenial main" | sudo tee /etc/apt/sources.list.d/mono-official.list
sudo apt-get update
sudo apt-get install mono-complete
```

* [Wine](https://www.winehq.org/)   
```
wget -nc https://dl.winehq.org/wine-builds/Release.key
sudo apt-key add Release.key
sudo apt-add-repository https://dl.winehq.org/wine-builds/ubuntu/
sudo apt-get update
sudo apt-get install --install-recommends winehq-stable
```

####Create a binaries

```
$ git clone https://github.com/elementrem/mist
$ cd mist   
```
When you run `npm install`, It may or may not be able to see several errors related to the macos. But don't worry. osx dependencies works only on MacOS. This is not related to Linux.
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
