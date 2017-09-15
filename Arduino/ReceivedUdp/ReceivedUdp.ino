/*

Receive UDP

 Hardware:
 * Adafruit Feather HUZZAH ESP8266
 * WS2812 LED Strip

 Description:
 * Udp Wifi receiver that changes color according to RGB values and ID

 created 22 August 2017
 by Imanol Gómez

 */


#include <ESP8266WiFi.h>
#include "FastLED.h"
#include <WiFiUdp.h>

#define NUM_LEDS 15
#define DATA_PIN 14
#define LED_TYPE    WS2812
#define COLOR_ORDER GRB

#define UDP_PACKET_SIZE 256
#define PACKET_SIZE 7

#define MAX_DATA_ELEMENTS 4    // the maximum number of integers in one received string


int input[MAX_DATA_ELEMENTS];  // array that will hold the received integers

// Define the array of leds
CRGB leds[NUM_LEDS];

// Defines for wifi
int status = WL_IDLE_STATUS;
char ssid[] = "Don't worry, be happy!"; //  your network SSID (name)
char pass[] = "whyistheskysohigh?";    // your network password (use for WPA, or use as key for WEP)

//char ssid[] = "TP-LINK_54E4"; //  your network SSID (name)
//char pass[] = "27155332";    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;            // your network key Index number (needed only for WEP)


IPAddress ip(192, 168, 1, 21); // Device fixed IP Address
IPAddress gateway(192, 168, 1, 1); // set gateway to match your network
IPAddress subnet(255, 255, 255, 0); // set subnet mask to match your network

// Defines for UDP
unsigned int localPort = 55766;
WiFiUDP Udp;
const char PACKET_START = 'd';
const char PACKET_END = 255;
const char PACKET_ID = 21;

char packetBuffer[UDP_PACKET_SIZE]; //buffer to hold incoming packet
int receivedUdpLength = 0;
char  ReplyBuffer[PACKET_SIZE];       // a udp message to send back

bool thisPacketIsNotEmpty = false;
bool previousPacketIsLoaded = false;




void setup() {
  setupSerial();
  setupWifi();
  setupLeds();

}

void setupSerial() {
   //Initialize serial and wait for port to open:
  Serial.begin(115200);
  delay(100);
}

void initialize() {

  setAllLedsBlack();
  initializeWifi();
  initializeInput();
  
}

void initializeWifi() {
    WiFi.disconnect();
    Udp.stop();
    Udp.flush();
  
    // check for the presence of the shield:
    if (WiFi.status() == WL_NO_SHIELD) {
      Serial.println("WiFi shield not present");
      // don't continue:
      while (true);
    }

  
  WiFi.config(ip, gateway, subnet);
}

void initializeInput(){

  for(int i=0; i<MAX_DATA_ELEMENTS; i++){
    input[i] = 0;
  }
}

void setupWifi() {

  initialize();
  
   // scan for existing networks:
  //Serial.println("Scanning available networks...");
  //listNetworks();
  
  // Print WiFi MAC address:
  printMacAddress();


  connectWifi();
  printWiFiStatus();
  
}

void connectWifi() {
     // attempt to connect to WiFi network:
   Serial.print("Attempting to connect to SSID:... ");
   Serial.println(ssid);
  
    WiFi.begin(ssid, pass);
  
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
   }
 
   Serial.print("\nConnected to SSID: ");
   Serial.println(ssid);

   Serial.println("IP address: ");
   Serial.println(WiFi.localIP());
  
    Serial.print("\nStarting connection to UDP port ");
    Serial.println(localPort);
    // if you get a connection, report back via serial:
    Udp.begin(localPort);
    Udp.flush();
}

void setupLeds() {

    FastLED.addLeds<LED_TYPE,DATA_PIN,COLOR_ORDER>(leds, NUM_LEDS).setCorrection(UncorrectedColor);
    FastLED.setMaxPowerInVoltsAndMilliamps (5, 2400);
    setAllLedsBlack();
}

void loop() {

    checkWifiConnection();
    parseUdp();
}

void parseUdp()
{
  // if there's data available, read a packet
  int packetSize = Udp.parsePacket();
  if (packetSize)
  {
       //Serial.print("Received packet of size ");
       //Serial.println(packetSize);
    
      readUdp();
      //parseLeds();
      //sendUdpReply();
  }
}

void checkWifiConnection(){
  if(WiFi.status() != WL_CONNECTED) {
      
      initialize();
      connectWifi();
      printWiFiStatus();
   }
}

void readUdp() {

//        while (true) {
//        thisPacketIsNotEmpty = (Udp.parsePacket() > 0);
//    
//        if (thisPacketIsNotEmpty) { // raise flag that a packet is loaded and read it in the buffer
//          previousPacketIsLoaded = true;
//          receivedUdpLength = Udp.read(packetBuffer, UDP_PACKET_SIZE);
//        }
//        else if (!thisPacketIsNotEmpty && previousPacketIsLoaded) { // if the current packet is empty, but a loaded packet exists, break out of the loop
//          previousPacketIsLoaded = false;
//          Udp.flush();
//          break;
//        }
//  }

   
//    Serial.print("From ");
//    IPAddress remoteIp = Udp.remoteIP();
//    Serial.print(remoteIp);
//    Serial.print(", port ");
//    Serial.println(Udp.remotePort());

    // read the packet into packetBufffer
    receivedUdpLength = Udp.read(packetBuffer, 255);

//     Serial.println("Contents:");
//    Serial.println(packetBuffer);
    
    if(isMessage(packetBuffer, receivedUdpLength)){
      parseMessage();
    }
    
   

}

void parseMessage() {
  
    if(receivedUdpLength>=PACKET_SIZE)
    {  
        if(packetBuffer[1] == 'h'){
            sendID();
        }
        else {
            if(packetBuffer[2] == 1){
            readHeight(packetBuffer[1], packetBuffer[5]);
             }
        }
   }
}

void sendID()
{
   char replyBuffer[4] = {PACKET_START, 'i', PACKET_ID, PACKET_END};
   // send a reply, to the IP address and port that sent us the packet we received
    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
    Udp.write(replyBuffer);
    Udp.endPacket();

    Serial.println("Send ID: ");
    IPAddress remoteIp = Udp.remoteIP();
    Serial.print(remoteIp);
    Serial.print(", port ");
    Serial.println(Udp.remotePort());
    
}

void readHeight(char id, char _value)
{
   if(id == PACKET_ID)
   {
      //Serial.print("ReadHeight");
      updateHeight(_value);
   }
    
}

void updateHeight(char _value)
{  
   int v = int(_value);
   //Serial.print("Value "); Serial.println(v);
   
   int height = v*NUM_LEDS/254;
  // Serial.print("Num Leds: "); Serial.println(height);
   updateLeds(height);
    
}


void updateLeds(int numLeds) 
{
    for(int i=0; i<numLeds; i++){
        leds[i] =  CRGB::Red;
    }

     for(int i=numLeds; i<NUM_LEDS; i++){
        leds[i] =  CRGB::Black;
    }

    FastLED.show();

    
//   int id = input[0];
//   Serial.print("ID: "); Serial.println(id);
//   Serial.print("R: "); Serial.println(input[1]);
//   Serial.print("G: "); Serial.println(input[2]);
//   Serial.print("B: "); Serial.println(input[3]);
//
//    CRGB color =  CRGB(input[1],input[2],input[3]);
//    
//    for(int i=0; i<NUM_LEDS; i++){
//        leds[i] =  color;
//    }
//
//    FastLED.show();
}
void getValues(char * str,int * values, int maxelements) {
  // function to parse the given string and populate the values integer array
  // maxelements is the number of elements in the given values array
  // Note: this version assumes that the string is properly formed (i.e. contains only integers seperated by commas)
  char *result = NULL;
  int index = 0;
  result = strtok( str, "," );
  while( (result != NULL) && (index < maxelements) ) {
    values[index++] = atoi(result);
    result = strtok( NULL, "," );
  }
}

void setAllLedsBlack() {

    for(int i=0; i<NUM_LEDS; i++){
        leds[i] =  CRGB::Black;
    }

    FastLED.show();
}


void sendUdpReply() {
   // send a reply, to the IP address and port that sent us the packet we received
    Udp.beginPacket(Udp.remoteIP(), Udp.remotePort());
    Udp.write(ReplyBuffer);
    Udp.endPacket();
}


void printMacAddress() {
  // the MAC address of your WiFi shield
  byte mac[6];

  // print your MAC address:
  WiFi.macAddress(mac);
  Serial.print("MAC: ");
  Serial.print(mac[5], HEX);
  Serial.print(":");
  Serial.print(mac[4], HEX);
  Serial.print(":");
  Serial.print(mac[3], HEX);
  Serial.print(":");
  Serial.print(mac[2], HEX);
  Serial.print(":");
  Serial.print(mac[1], HEX);
  Serial.print(":");
  Serial.println(mac[0], HEX);
}

void printWiFiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}

void listNetworks() {
  // scan for nearby networks:
  Serial.println("** Scan Networks **");
  int numSsid = WiFi.scanNetworks();
  if (numSsid == -1)
  {
    Serial.println("Couldn't get a wifi connection");
    while (true);
  }

  // print the list of networks seen:
  Serial.print("number of available networks:");
  Serial.println(numSsid);

  // print the network number and name for each network found:
  for (int thisNet = 0; thisNet < numSsid; thisNet++) {
    Serial.print(thisNet);
    Serial.print(") ");
    Serial.print(WiFi.SSID(thisNet));
    Serial.print("\tSignal: ");
    Serial.print(WiFi.RSSI(thisNet));
    Serial.print(" dBm");
    Serial.print("\tEncryption: ");
    printEncryptionType(WiFi.encryptionType(thisNet));
    Serial.flush();
  }
}

void printEncryptionType(int thisType) {
  // read the encryption type and print out the name:
  switch (thisType) {
    case ENC_TYPE_WEP:
      Serial.println("WEP");
      break;
    case ENC_TYPE_TKIP:
      Serial.println("WPA");
      break;
    case ENC_TYPE_CCMP:
      Serial.println("WPA2");
      break;
    case ENC_TYPE_NONE:
      Serial.println("None");
      break;
    case ENC_TYPE_AUTO:
      Serial.println("Auto");
      break;
  }
}

bool isMessage(char* _buffer, int bufferSize){
  
   if(bufferSize<PACKET_SIZE){
    return false;
   }

   if(_buffer[0]!=PACKET_START){
    return false;
   }

   if(_buffer[PACKET_SIZE-1]!=PACKET_END){
    return false;
   }

   //Serial.println("MESSAGE RECEIVED!!!");
   return true;
   
}

