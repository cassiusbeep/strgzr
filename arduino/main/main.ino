#include <Servo.h>
#include <Stepper.h>

// defines number of steps in the stepper (x rotator)
#define STEPS 64

Stepper stepperX(STEPS, 8, 9, 10, 11); // create stepper(step_no, pins)
Stepper stepperY(STEPS, 4, 5, 6, 7); // create stepper(step_no, pins)
// Servo servoY; // create servo object for vertical servo

int pos_x = 0; // variable to store servo x's position
int pos_y; // need to reset servo y's position

void setup() {
  // servoY.attach(); // TODO: find out pins for y servo

  // start serial port at 9600 bps and wait for port to open:
  Serial.begin(9600); // initialise USB listener
  // Serial1.begin(38400);
  stepperX.setSpeed(60);
  stepperY.setSpeed(60);
}

void loop() {
  // if (Serial.available() > 0) {
  //   Seral.write(1);
  //   String mvmtString = Serial.readString(); // read input from USB
  //   Serial.print(mvmtString); // print received string to USB
  //   // split string into X and Y arguments
  //   int separator = mvmtString.indexOf(",");
  //   int xSteps = mvmtString.substring(0, separator).toInt();
  //   int ySteps = mvmtString.substring(separator + 1, mvmString.length - 1).toInt();
  //   // send X and Y to steppers
  //   stepperX.step(xSteps);
  //   stepperY.step(ySteps);
  //   Serial.write(1); // confirm orientation complete
  // }

  if (Serial.available() > 0) {

    while (Serial.available() > 0) { // read the incoming byte:
      static char mvmtString[8];
      static unsigned int message_pos = 0;
      char c = Serial.read();  //gets one byte from serial buffer

      if (c != '!' && (message_pos < 7)) {
        mvmtString[message_pos] = c;
        message_pos++;
      } else {
        mvmtString[message_pos];
        Serial.println(mvmtString);
        message_pos = 0;
        if (mvmtString.length() > 0) {
        // split string into X and Y arguments
        int separator = mvmtString.indexOf(",");
        int xSteps = mvmtString.substring(0, separator).toInt();
        int ySteps = mvmtString.substring(separator + 1, mvmtString.length() - 1).toInt();
        // send X and Y to steppers
        stepperX.step(xSteps);
        stepperY.step(ySteps);
        Serial.write(1); // confirm orientation complete
    }
      }
    }
  }
  //   if (mvmtString.length() > 0) {
  //     Serial1.print(mvmtString);
  //     int separator = mvmtString.indexOf(",");
  //     int xSteps = mvmtString.substring(0,separator).toInt();
  //     int ySteps = mvmtString.substring(separator + 1).toInt();
  //     stepperX.step(xSteps);
  //     stepperY.step(ySteps);
  //     Serial1.print("Done\n");
  //     mvmtString=""; //clears variable for new input
  //   }
    
  // } 
}
