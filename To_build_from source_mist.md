### To build from source	

***As a general rule, Do not lose your password and keystore and Mist stores file. In any case, recovery is impossible.***
***And it doesn't collect any personally identifiable information.***

-------------------------------------------
### Prerequisite:

Don't expect that you can build app for all platforms on one platform.
- If your app has native dependencies, it can be compiled only on the target platform. prebuild is a solution, but most node modules don't provide prebuilt binaries.
- OS Code Signing works only on MacOS. Cannot be fixed.
- Elementrem Mist provides support for 64-bit only.

`sudo apt-get install -y git unzip`   

* [Curl](https://curl.haxx.se/)  	 	                    
`sudo apt-get install curl`   
* [Node.js](https://nodejs.org/)    
`curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`  
`sudo apt-get install -y nodejs`   
* [Meteor](https://www.meteor.com/)   
`curl https://install.meteor.com/ | sh`   
* [yarn](https://yarnpkg.com/)	            
`curl -o- -L https://yarnpkg.com/install.sh | bash`
* [Meteor Build Client](https://github.com/frozeman/meteor-build-client/) 	  
`yarn global add meteor-build-client`    
* [Electron](http://electron.atom.io/)        
`yarn global add electron@1.7.11`   
* [Gulp](http://gulpjs.com/)    
`yarn global add gulp`  
* [Brew](http://linuxbrew.sh/)      
```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
$ nano ~/.profile
export PATH="$HOME/.linuxbrew/bin:$HOME/.linuxbrew/sbin:$PATH"
export PATH="/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:$PATH"
$ source ~/.profile
```

#### Tools for the Linux binaries     
`brew install gnu-tar libicns graphicsmagick xz`

#### Tools for the Windows binaries	
* [Wine](https://www.winehq.org/)  
`brew install wine`

#### Create a binaries

```
$ git clone https://github.com/elementrem/mist
$ cd mist   
```
```
$ yarn
```
```
// to generate mist-wallet
$ gulp --wallet --platform "<OS>"
```
OS Options are:    
* `mac`   
* `win`		
* `linux`

It expects binaries files to be in the generated folder;
`dist_wallet`

---------------------------------------------------
