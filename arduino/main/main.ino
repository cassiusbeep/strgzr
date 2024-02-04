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
    char read_byte = Serial.read();

    char* mvmtBytes[12];
    int pos = 0;

    while (Serial.available() > 0) { // read the incoming byte:
      delay(10);  //small delay to allow input buffer to fill
      char c = Serial.read();  //gets one byte from serial buffer
      
      if (c == '!' && (pos < 11)) {
        if (pos > 0) {
          String mvmtString(*mvmtBytes);
          int separator = mvmtString.indexOf(",");
          int xSteps = mvmtString.substring(0,separator).toInt();
          int ySteps = mvmtString.substring(separator + 1).toInt();
          stepperX.step(xSteps);
          stepperY.step(ySteps);
          mvmtString=""; //clears variable for new input
          pos = 0;
        } //breaks out of capture loop to print readstring
      } else {
        mvmtBytes[pos] = c;
        pos++;
      }
      
    } 
  }
    
    
  // } 
}
