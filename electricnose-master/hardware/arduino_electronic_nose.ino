#include <DHT.h>

// Match these pins to the wiring used on the breadboard.
const int MQ135_PIN = A0;
const int MQ3_PIN = A1;
const int FSR_PIN = A2;
const int DHT_PIN = 2;
const int DHT_TYPE = DHT11;

DHT dht(DHT_PIN, DHT_TYPE);

int boundedAnalogRead(int pin) {
  return constrain(analogRead(pin), 0, 1023);
}

void sendBaseline() {
  const int mq135 = boundedAnalogRead(MQ135_PIN);
  const int mq3 = boundedAnalogRead(MQ3_PIN);
  const float temperature = dht.readTemperature();
  const float humidity = dht.readHumidity();
  Serial.print("B,");
  Serial.print(mq135);
  Serial.print(",");
  Serial.print(mq3);
  Serial.print(",");
  Serial.print(isnan(temperature) ? 0.0 : temperature, 1);
  Serial.print(",");
  Serial.println(isnan(humidity) ? 0.0 : humidity, 1);
}

void sendScan() {
  const int mq135 = boundedAnalogRead(MQ135_PIN);
  const int mq3 = boundedAnalogRead(MQ3_PIN);
  const int fsr = boundedAnalogRead(FSR_PIN);
  const float temperature = dht.readTemperature();
  const float humidity = dht.readHumidity();
  Serial.print("S,");
  Serial.print(mq135);
  Serial.print(",0.0,");
  Serial.print(mq3);
  Serial.print(",0.0,");
  Serial.print(fsr);
  Serial.print(",");
  Serial.print(isnan(temperature) ? 0.0 : temperature, 1);
  Serial.print(",");
  Serial.println(isnan(humidity) ? 0.0 : humidity, 1);
}

void setup() {
  Serial.begin(9600);
  dht.begin();
  delay(1500);
  Serial.println("READY");
}

void loop() {
  if (!Serial.available()) return;
  const char command = Serial.read();
  if (command == 'B') sendBaseline();
  if (command == 'S') sendScan();
}