local-perspective
=======================

Local Perspective is a configurable template for highlighting features from a web map based on a user selected location or address.  In addition to your data, you can include demographics, lifestyle, live weather information and enable driving directions.

![Screen Shot](http://coolmaps.esri.com/templates/LocalPerspective/images/thumb.png)

[View it live] (http://coolmaps.esri.com/templates/LocalPerspective/?cycleColors=1)

#Features

The template can be configured using the following options:

Map: Choose the web map used in your application.

Text Title: The application name displayed in the application header.

Logo URL: The URL location for the application icon (logo).

Color: Choose either a single color scheme for the application or cycle through a unique color scheme for each layer.

Show Demographics: Choose this option to include demographic information about the selected location.

Show Lifestyle: Choose this option to include lifestyle information about the selected location based on Esri's tapestry segmentation neighborhood profile data.

Show Weather: Choose this option to include weather conditions for the selected location.

Enable Routing Directions: Choose this option to allow users to generate turn by turn directions. *

Route Utility Item: URL to route utility item (with stored credentials). *
*requires organization account.

Distance Units: Choose this distance units (miles, kilometers or meters).

Maximum Distance: Specify a maximum search distance.

Default Distance: Specify a default search distance.


#Instructions

1. Download and unzip the .zip file or clone the repo.
2. Web-enable the directory
3. Access the .html page
4. See the readme page for more details.


#Deploying

1. To deploy this application, download the template from Portal/ArcGIS Online and unzip it.
2. Copy the unzipped folder containing the web app template files, such as index.html, to your web server. You can rename the folder to change the URL through which users will access the application. By default the URL to the app will be `http://<Your Web Server>/<app folder name>/index.html`
3. Change the sharing host, found in defaults.js inside the config folder for the application, to the sharing URL for ArcGIS Online or Portal. For ArcGIS Online users, keep the default value of www.arcgis.com or specify the name of your organization.
  - ArcGIS Online Example:  `"sharinghost": location.protocol + "//" + “<your organization name>.maps.arcgis.com`
  - Portal Example where `arcgis` is the name of the Web Adaptor: `"sharinghost": location.protocol + "//" + "webadaptor.domain.com/arcgis"`
4. If you are using Portal or a local install of the ArcGIS API for JavaScript, change all references to the ArcGIS API for JavaScript in index.html to refer to your local copy of the API. Search for the references containing `"//js.arcgis.com/3.17"` and replace this portion of the reference with the url to your local install.
  - For example: `"//webadaptor.domain.com/arcgis/jsapi/jsapi"` where `arcgis` is the name of your Web Adaptor.
5. Copy a map or group ID from Portal/ArcGIS Online and replace the default web map ID in the application’s index.html page. You can now run the application on your web server or customize the application further.

> **Note:** If your application edits features in a feature service, contains secure services or web maps that aren't shared publicly, or generate requests that exceed 200 characters, you may need to set up and use a proxy page. Common situations where you may exceed the URL length are using complex polygons as input to a task or specifying a spatial reference using well-known text (WKT). For details on installing and configuring a proxy page see [Using the proxy](https://developers.arcgis.com/javascript/jshelp/ags_proxy.html). If you do not have an Internet connection, you will need to access and deploy the ArcGIS API for JavaScript documentation from [developers.arcgis.com](https://developers.arcgis.com/).


#Requirements

- Notepad or HTML editor
- Some background with HTML, CSS and JavaScript
- Experience with the ArcGIS API for JavaScript is helpful.

#Resources

- [ArcGIS API for JavaScript Resource Center](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html)

#Issues
Found a bug or want to request a new feature? Please let us know by submitting an issue.

#Contributing
Anyone and everyone is welcome to contribute.

#Licensing

Copyright 2014 Esri

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

A copy of the license is available in the repository's license.txt file.
[](Esri Tags: ArcGIS Online Web Application Templates)
[](Esri Language: JavaScript)

# Shared Themes

### Concept
The purpose of this forked repo is to streamline the process for developers to inherit theming from parent applications to child applications, and fulfill the shared-theme component of hub-ready apps. An example app and attached docs will allow internal Esri developers (and eventually Citizens) to create hub-ready applications in terms of shared-theming, whether they are starting from scratch or looking to make an existing app hub-ready.

### Walkthrough
---
#### Observe the example site
1. Clone this repo
2. Run http-server from the directory (download http-server if you do not have it on your machine)
  - Another option is to run “python -m SimpleHTTPServer 8000” from the directory with the index.html file.
3. Open up your locally hosted page and observe the example site, adding "/?theme=580".
```
e.g. - http://127.0.0.1:8080/?theme=580
```

Working sites ids to use in the query string (http://127.0.0.1:8080/?theme=594)
-	580
-	594

An additional option to adjust the mixed-in configuration include urls (against the open data v2 API). Working urls to use pre-query string (indicate use with ?theme=current) 
-	http://data5-logotester2.dc.opendatadev.arcgis.com/
-	http://data5-logotester4.dc.opendatadev.arcgis.com/
```
e.g. - http://data5-logotester4.dc.opendatadev.arcgis.com:8080/?theme=current
```

Another option is adjust the config parameters of an existing application on ArcGIS Online. Working appIds (configs available for viewing in the Configuration Parameters section of the "settings" tab of the related appId)

```
e.g. - http://127.0.0.1:8080/?appid=06f0c9022dc6411598babb9cdbc768fc
```

-	5aab4b150da3428289391ada56d7eaad
-	06f0c9022dc6411598babb9cdbc768fc
-	4d06775fbd5a4ae5bffe34ce5b37255a
  - http://dcdev.maps.arcgis.com/home/item.html?id=4d06775fbd5a4ae5bffe34ce5b37255a#settings
