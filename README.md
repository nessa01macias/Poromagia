# Poromagia
Created by Metropolia University of Applied Science students, 3rd year, Smart IoT Systems major.
Contributors: Manish Subedi, Ahmed Al-Tuwaijari, Melany Macias, Sophia Schwalb. <br> 

More documentation can be found in the following destinations:
* Detailed information on the project technical aspects can be found here: [CLICK](https://github.com/nessa01macias/Poromagia/blob/master/Documentation.pdf)
* Detailed information on the user manual can be found here: [CLICK](https://github.com/nessa01macias/Poromagia/blob/master/User%20Manual.pdf)

### Final project for the course Internet of Things (IoT) Project TX00CI65-3010.

# Description
The aim of the project is to produce a card sorter for Poromagia's company. Poromagia is a Finnish stablished company that distributes collectible cards and other products related to gaming. The value of the Magic The Gathering collectible cards that the company works with varies from a few cents per card to thousands of euros, and Poromagia's warehouse can contain thousands of euros in cards that need to be sorted by their employees on daily basis. <br>
The porpuse of the machine is to implement automated sorting for Poromagia's collection cards in order to save significant amounts of time, avoid human labour, reduce financial expenses, and decrease sorting errors. This is achieved by using a software that recognizes which card it is looking at, a web interface where the user select one category that the card's clasification should be based on, and a moving plane that takes the respective card to its correct category.

# Contents
- [User manual](#user-manual)
  * [Machine's description](#machine-description)
  * [Web page's interface](#webpage-interface)
  * [Installation](#installation)
  * [Setting up](#setting)
  
   
 ##  Installation
 The smart sorting machine is meant to be used independantly, therefore all the necessary configurations have been done already in respective sites (Raspberry Pi and AWS Cloud Server), however it can also be run locally if needed. To achieve this, follow the steps:
 
1. To install the web application, clone the repository into your selected directory.
```
git clone https://github.com/nessa01macias/Poromagia.git
```
Downloading as a .zip package is available on the Github interface.

2. To install all the back end dependancies required, go to the the root folder and  follow the next steps.

Install all the python modules by running 
```
pip install -r requirements.py
```
Install all the nodejs dependancies needed by running
```
npm install
```
3. To install all the front end dependancies required, go to the frontend folder, and run
```
npm install
```
## Setting up
The project can be executed by running the following commands
```
node server.js
```
```
ng serve 
```



