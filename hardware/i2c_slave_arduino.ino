/*Arduino Slave for Raspberry pi Master */

/* Include the Wire library for I2C */
#include <Wire.h>
 
/* LED on pin 13 */
const int ledPin = 13;

/* this holds the decision from Raspi */
static int decision = 0;

void setup() {
  Serial.begin(9600);
  // Join I2C bus as slave with address 8
  Wire.begin(0x8);
  
  // Call receiveEvent when data received                
  Wire.onReceive(receiveEvent);
  
  // Setup pin 13 as output and turn LED off
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);

  Serial.println("All right!!");
}
 
// Function that executes whenever data is received from master
void receiveEvent(int howMany) {
  char buff[15];
  while (Wire.available()) { // loop through all but the last
    char c = Wire.read(); // receive byte as a character
    decision = static_cast<int>(c);
    snprintf(buff, 15, "num = %d", decision);
    Serial.println(buff);
  }
}
void loop() {
  delay(100);
}
