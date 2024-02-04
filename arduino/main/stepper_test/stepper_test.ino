#include <Stepper.h>

const int stepsPerRevolution = 64;  // change this to fit the number of steps per revolution
// for your motor

// initialize the stepper library on pins 8 through 11:
Stepper myStepper(stepsPerRevolution, 8, 9, 10, 11);
Stepper myStepper2(stepsPerRevolution, 4, 5, 6, 7);

int stepCount = 0;         // number of steps the motor has taken

void setup() {
  myStepper.setSpeed(60);
  myStepper2.setSpeed(60);
  // initialize the serial port:
  Serial.begin(9600);
}

void loop() {
  myStepper.step(1);
  myStepper2.step(1);
  Serial.print("steps:");
  Serial.println(stepCount);
  stepCount++;
  delay(1);
}