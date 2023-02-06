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
# Software architecture
The design of the project architecture can be found below. Multiple programming 
languages, various communication protocols, cloud servers and databases, as 
well as frameworks have been used.<br><br> 
![Architecture](https://github.com/nessa01macias/Poromagia/blob/master/architecture_overview.drawio.svg.jpg)
<br> All starts with the **Arduino**, whose code was developed in **C++**, since it is the 
lowest programming part included. This communicates with the machine and 
allows movement in general. Because the arduino used does not have a wifi 
module, it communicates with the **Raspberry Pi** via I2C.<br><br> 
The web page which is fundamental to be able to start using the machine by 
selecting a category, has its frontend made in **Angular using TypeScript**. This is 
shown in the screen shown in figure 3, where the user is allowed to interact with 
the system.<br><br> 
The **frontend** communicates constantly with the **backend**, which is made in 
**Nodejs with javascript** and is located in the cloud, on an **Amazon Web Services 
Linux Server**. A cloud server is necessary since the front end of the site is on the 
raspberry, but the backend requires more computational resources, therefore it 
must be located somewhere else more powerful that can provide answers in a
matter of few seconds. In addition, this allows calls to be made to the endpoints 
from everywhere.<br><br> 
Inside the server, besides the backend where all the endpoints are created, there 
is the **computer vision model** developed in **Python**, which is called from Nodejs 
every time it is necessary, as a separate process. This is the most resource consuming part, since it uses a text recognition model called easyOCR that 
extracts the data from the cards. In addition, it compares the photo taken with 
many of the cards in the card collection database, so it needs to make requests 
and have space to compare all possible card matches.<br><br> 
In addition, on the remote server, the connection to the **MongoDB database** is 
made, which is also located in the cloud, in Atlas Cloud. The database in the 
cloud was also necessary, since in order to be able to display data on the website, 
it had to be accessible from the frontend.<br><br> 
On the other hand, the backend also publishes messages via **MQTT**, so the 
project must contain a private broker that allows intercommunication between 
remote devices. This is necessary because it allows the user from the web page 
(front end) to send messages about the status of the machine, to stop its process 
or start it.<br><br> 
Finally, the centre of all communications, the Raspberry Pi, takes care of multiple 
tasks that are essential to the system. Not only does it serve the front end of the 
web page, but it also receives messages from the MQTT Broker, communicates 
with the Arduino, has a camera connected to it, and calls the main backend 
endpoint sending it the picture taken of the card. Because the microcontroller had 
to perform all these different tasks, Raspberry Pi was the most suitable choice 
due to its powerful processor.


... more detailed information on the project technical aspects can be found here: [CLICK](https://github.com/nessa01macias/Poromagia/blob/master/Documentation.pdf)
