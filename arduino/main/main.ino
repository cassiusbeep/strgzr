#include <Stepper.h>

// defines number of steps in the stepper (x rotator)
#define STEPS 64

Stepper stepperX(STEPS, 8, 9, 10, 11); // create stepper(step_no, pins)
Stepper stepperY(STEPS, 4, 5, 6, 7); // create stepper(step_no, pins)

void setup() {
  // servoY.attach(); // TODO: find out pins for y servo

  // start serial port at 9600 bps and wait for port to open:
  Serial.begin(9600, 12); // initialise USB listener
  stepperX.setSpeed(60);
  stepperY.setSpeed(60);
}

void loop() {
  if (Serial.available() > 0) {
    const byte numChars = 12;
    char receivedChars[numChars];
    
    int pos = 0;
    char c;

    while (Serial.available() > 0) { // read the incoming byte:
      c = Serial.read();  //gets one byte from serial buffer
      
      if (c == '!') {
        // finish. parse and process the received data
        receivedChars[pos] = c;
        String mvmtString = String(receivedChars);
        int separator = mvmtString.indexOf(",");
        int xSteps = mvmtString.substring(0,separator).toInt();
        int ySteps = mvmtString.substring(separator + 1).toInt();
        stepperX.step(xSteps);
        stepperY.step(ySteps);
        mvmtString=""; //clears variable for new input
        memset(receivedChars, 0, sizeof(receivedChars));
        pos = 0; 
      } else {
        receivedChars[pos] = c;
        pos++;
      }
    } 
  }
    
    
  // } 
}
