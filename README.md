# Poromagia
Created by Metropolia University of Applied Science students, 3rd year, Smart IoT Systems major.
Contributors: Manish Subedi, Ahmed Al-Tuwaijari, Melany Macias, Sophia Schwalb. <br> 

More documentation can be found in the following destinations:
* Detailed information on the user manual can be found here: [CLICK](https://www.google.com)
* Detailed information on the project architecture can be found here: [CLICK](https://www.google.com)

### Final project for the course Internet of Things (IoT) Project TX00CI65-3010.

# Description
The aim of the project is to produce a card sorter for Poromagia's company. Poromagia is a Finnish stablished company that distributes collectible cards and other products related to gaming. The value of the Magic The Gathering collectible cards that the company works with varies from a few cents per card to thousands of euros, and Poromagia's warehouse can contain thousands of euros in cards that need to be sorted by their employees on daily basis. <br>
The porpuse of the machine is to implement automated sorting for Poromagia's collection cards in order to save significant amounts of time, avoid human labour, reduce financial expenses, and decrease sorting errors. This is achieved by using a software that recognizes which card it is looking at, a web interface where the user select one category that the card's clasification should be based on, and a moving plane that takes the respective card to its correct category.

# Contents
- [User manual](#user-manual)
  * [Machine's description](#machine-description)
  * [Web page's interface](#webpage-interface)
  * [Installation](#installation)
  
- [Documentation](#documentation)
  * [Technologies](#technologies)
  * [Database access](#database-access)
 
 # User manual
 ## Physical machine description
 
 ## Web page's interface
  
 ##  Installation
 The smart sorting machine is meant to be used independantly, therefore all the necessary configurations have been done already in respective sites (Raspberry Pi and AWS Cloud Server), however it can also be run locally if needed. To achieve this, follow the steps:
 
1. To install the web application, clone the repository into your selected directory.
```
git clone https://github.com/nessa01macias/Poromagia.git
```
Downloading as a .zip package is available on the Github interface.

2. To install all the back end dependancies required, go to the the root folder and next steps.

2.1 Install all the python modules by running 
```
pip install -r requirements.py
```
2.2 Install all the nodejs dependancies needed by running
```
npm install
```

* In backend > resources folder, run node backend.js
* In frontend folder, run ng serve --open

2. Install angular dependancies nodejs dependancies by going to that specific folder and writing the command npm install. 

### Bibliography 
https://sease.io/2021/10/how-to-manage-a-large-json-file-efficiently-and-quickly.html https://www.kdnuggets.com/2018/03/5-things-big-data.html https://www.youtube.com/watch?v=9N6a-VLBa2I&t=171s&ab_channel=CoreySchafer https://www.udemy.com/course/raspberry-pi-full-stack-raspbian/learn/lecture/9607964?start=15#overview https://www.youtube.com/watch?v=WQeoO7MI0Bs&ab_channel=Murtaza%27sWorkshop-RoboticsandAI https://www.youtube.com/watch?v=nnH55-zD38I&ab_channel=Murtaza%27sWorkshop-RoboticsandAI https://www.computervision.zone/ https://towardsdatascience.com/calculating-string-similarity-in-python-276e18a7d33a https://superuser.com/questions/519939/download-a-pdf-from-a-website-every-24-hours https://stackoverflow.com/questions/44751942/how-would-you-automate-downloading-a-file-from-a-site-everyday-using-python https://blog.sqlizer.io/posts/convert-json-to-sql/ https://www.youtube.com/watch?v=9N6a-VLBa2I&t=171s&ab_channel=CoreySchafer https://www.youtube.com/watch?v=ADV-AjAXHdc&ab_channel=PythonTutorialsforDigitalHumanities

{under construction}


