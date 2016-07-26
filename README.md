[![Code HTML5](https://img.shields.io/badge/code-HTML5-blue.svg)](https://www.w3.org/TR/html5/)
[![Code CSS3](https://img.shields.io/badge/code-CSS3-blue.svg)](http://www.w3schools.com/css/css3_intro.asp)
[![Code JS](https://img.shields.io/badge/code-JS-blue.svg)](http://www.w3schools.com/js/)
[![Desgin Responsive](https://img.shields.io/badge/design-Responsive-blue.svg)](http://www.w3schools.com/html/html_responsive.asp)
[![Desgin Google Design](https://img.shields.io/badge/design-Google%20Design-blue.svg)](https://design.google.com/)  
[![lib Google Maps](https://img.shields.io/badge/lib-Google%20Maps-green.svg)](https://developers.google.com/maps/documentation/javascript/)
[![lib jQuery](https://img.shields.io/badge/lib-jQuery-green.svg)](https://jquery.com/)
[![lib jQueryMobile](https://img.shields.io/badge/lib-jQuery%20Mobile-green.svg)](https://jquerymobile.com/)
[![lib Modernizr](https://img.shields.io/badge/lib-Modernizr-green.svg)](https://modernizr.com/)
[![lib sweetAlert](https://img.shields.io/badge/lib-Sweet%20Alert-green.svg)](https://t4t5.github.io/sweetalert/)
[![lib Bootstrap](https://img.shields.io/badge/lib-Bootstrap-green.svg)](http://getbootstrap.com/)
[![lib Font Awesome](https://img.shields.io/badge/lib-Font%20Awesome-green.svg)](http://fontawesome.io/)  
[![Build Maven](https://img.shields.io/badge/build-Maven-lightgrey.svg)](https://maven.apache.org/)
[![Version 0.1](https://img.shields.io/badge/Version-0.1-lightgrey.svg)](#version)

# FarolApp4All Web
This web application conect with FarolApp4All Api and show the farols.  
This project is a GUI for FarolApp4All Api.


# Table of Contents
1. [Pre-requisites](#pre-requisites)
2. [Configuration](#configuration)  
2.1. [Google Maps API key](#googleMapsApiKey)  
2.2. [Change API URL](#changeAPI_URL)  
3. [Compile](#compile)
4. [Deploy](#deploy)
5. [Development guide](#developmentGuide)
6. [Version](#version)  
  

## 1) Pre-requisites <a name="pre-requisites"></a>
* Maven 3.0 or later.
* Java 1.7 or later (for maven).
* Tomcat 1.7 or later (for the development). You can put the files of "src/main/webapp" on a other web server.
* Internet connection if you use maven (for downloading dependencies).

## 2) Configuration <a name="configuration"></a>
***2.1) Google Maps API key*** <a name="googleMapsApiKey"></a>   
To get the Google Maps Api Key, follow this manual:  
https://developers.google.com/maps/documentation/javascript/get-api-key  
Edit src/main/webapp/index.html and change the next script:  
```
<!-- Google Maps Javascript Api -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=visualization" type="text/javascript"></script>
```

***2.2) Change API URL*** <a name="changeAPI_URL"></a>  
To change API URL edit the follow file:  
"src/main/webapp/resources/js/gui.js"  
Search the next line and change it:  
```js
var FarolApp_API_URL = 'http://infra3.dia.fi.upm.es/api/';
```
Remember add to the end the "/" character.  
For further information visit:  
https://github.com/liveldp/api  

## 3) Compile <a name="compile"></a>

To compile, type in a cmd or terminal (On project folder, you need see the pom.xml):
```sh
mvn clean install
```

Generated files are inside "target" folder. 

## 4) Deploy <a name="deploy"></a>

After changing the settings you can compile the tool, generating a WAR file. You will deploy this WAR file on a tomcat manager or copy the folder "FarolApp4All" (in "target" folder) into the webapps folder of tomcat (or other web server).  
For futher information visit: https://tomcat.apache.org/tomcat-7.0-doc/deployer-howto.html

## 5) Development guide <a name="developmentGuide"></a>  

For development guide visit the follow link:  
[Development Guide](wiki/Development-guide)

## 6) Version <a name="version"></a>
0.1
