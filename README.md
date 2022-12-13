# Poromagia
Created by Metropolia University of Applied Science students, 3rd year, Smart IoT Systems major.
Contributors: Manish Subedi, Ahmed Al-Tuwaijari, Melany Macias, Sophia Schwalb. <br> 

More documentation can be found in the following destinations:
* Detailed information on the user manual can be found here: [CLICK] (www.google.com)
* Detailed information on the project architecture can be found here: [CLICK] (www.google.com)

### Final project for the course Internet of Things (IoT) Project TX00CI65-3010.

## Concept
The aim of the project is to produce a card sorter for Poromagia's company. Poromagia is a Finnish stablished company that distributes collectible cards and other products related to gaming. The value of the Magic The Gathering collectible cards that the company works with varies from a few cents per card to thousands of euros, and Poromagia's warehouse can contain thousands of euros in cards that need to be sorted by their employees on daily basis. <br>
The porpuse of the machine is to implement automated sorting for Poromagia's collection card that saves significant amounts of timem, avoids human labour, reduces financial expenses, and decreases errors. The cards are sort the cards in different categories, such as "price", "stock" or "wanted". The idea is to use a camera to identify the top card in the deck. After the picture is taken, the software which also contains a computer vision model, knows the value of the card and uses a suction cup to move the card to the right place. Suction cup between the different card positions is implemented by means of a moving plane. The moving plane moves by means of a stepper motor on the frame. The purpose of the platform is to move the suction cup arm to the correct position and lower the card into the correct housing. There are five card slots, a shuffled deck, valuable cards, medium-priced cards, cheap cards and unidentified cards. The device is controlled via a touch screen, which allows the selection of the correct programme for the cards for sorting the cards.

### Description of code source implemented in python (backend -> source)
text_parser_class -> Class created to extract the name and type of card, situated at the top and around the middle of it. The card goes through various pre-processing methods: first, it is converted to black and white, as that makes the processing easier and consumes less computation resources, then thresholding is applied in order to get a clear contrast of the text, then the regions of interest are extracted, and they are removed noise and eliminated borders if the image is mainly white.<br /> image_recognition_class -> Class created to find the card among all the more than 300.000 possibilities of match. The class receives the data gotten from the text_parser_class, and goes through multiple steps as: excluding from the database every card that does not have the same name, type or language as the original card, opening all the possible matches images, and finding the similarities between the original card and each one of the matches. The one that performs the better (gets the highest score in the orb_sim function), is the image we are looking for.<br />
get_match -> File created in order to link both of the main classes, text_parser and image_recognition and make tests with the results.

### How to run the project? 
* Install angular dependancies, nodejs dependancies by going to that specific folder and writing the command npm install. 
* Install python modules by running pip install -r requirements.py
* In backend > resources folder, run node backend.js
* In frontend folder, run ng serve --open


### Resources folder 
Some pictures of the pokemon cards will be included here for developing and testing the CV algorithm before we have implemented also the other part of the project. I have included also some other resources such as the card parts location, and how to identify columns and rows for each card.

### Bibliography 
https://sease.io/2021/10/how-to-manage-a-large-json-file-efficiently-and-quickly.html https://www.kdnuggets.com/2018/03/5-things-big-data.html https://www.youtube.com/watch?v=9N6a-VLBa2I&t=171s&ab_channel=CoreySchafer https://www.udemy.com/course/raspberry-pi-full-stack-raspbian/learn/lecture/9607964?start=15#overview https://www.youtube.com/watch?v=WQeoO7MI0Bs&ab_channel=Murtaza%27sWorkshop-RoboticsandAI https://www.youtube.com/watch?v=nnH55-zD38I&ab_channel=Murtaza%27sWorkshop-RoboticsandAI https://www.computervision.zone/ https://towardsdatascience.com/calculating-string-similarity-in-python-276e18a7d33a https://superuser.com/questions/519939/download-a-pdf-from-a-website-every-24-hours https://stackoverflow.com/questions/44751942/how-would-you-automate-downloading-a-file-from-a-site-everyday-using-python https://blog.sqlizer.io/posts/convert-json-to-sql/ https://www.youtube.com/watch?v=9N6a-VLBa2I&t=171s&ab_channel=CoreySchafer https://www.youtube.com/watch?v=ADV-AjAXHdc&ab_channel=PythonTutorialsforDigitalHumanities

{under construction}


