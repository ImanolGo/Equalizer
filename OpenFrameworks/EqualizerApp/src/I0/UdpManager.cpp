/*
 *  UdpManager.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 22/08/17.
 *
 */



#include "UdpManager.h"
#include "AppManager.h"

#ifndef TARGET_WIN32
#include "ofxMyIP.h"
#endif


const int UdpManager::UDP_MESSAGE_LENGHT = 10000;

const char UdpManager::START_COMMAND = 'd';
const char UdpManager::END_COMMAND = 255;
const char UdpManager::ID_COMMAND = 'i';
const char UdpManager::HEARTBEAT_COMMAND = 'b';

UdpManager::UdpManager(): Manager(), m_id(0), m_broadcast("")
{
    //Intentionally left empty
}

UdpManager::~UdpManager()
{
   ofLogNotice() << "UdpManager::destructor";
}


//--------------------------------------------------------------

void UdpManager::setup()
{
    if(m_initialized)
        return;
    
    Manager::setup();
    
    this->setupIP();
    this->setupUdpConnection();
    //this->createConnections();
    this->setupText();
    this->sendAutodiscovery();
    
    ofLogNotice() <<"UdpManager::initialized" ;
}

void UdpManager::setupUdpConnection()
{
    int portReceive = AppManager::getInstance().getSettingsManager().getUdpPortReceive();
    ofLogNotice() <<"UdpManager::setupUdpReceiver -> listening for udp messages on port  " << portReceive;
    
    //m_udpConnection.SetEnableBroadcast(true);
    m_udpConnection.Create(); //create the socket
    m_udpConnection.Bind(portReceive); //and bind to port
    
    
    string ip = AppManager::getInstance().getSettingsManager().getIpAddress();
    int portSend = AppManager::getInstance().getSettingsManager().getUdpPortSend();
   
    m_udpConnection.Connect(m_broadcast.c_str(),portSend);
    //m_udpConnection.Connect(ip.c_str(),portSend);
    m_udpConnection.SetEnableBroadcast(true);
    
    ofLogNotice() <<"UdpManager::setupUdpReceiver -> sending to IP " << m_broadcast <<" to port " << portSend;
    
    m_udpConnection.SetNonBlocking(true);
}

void UdpManager::createConnections()
{
    string ipBase = "";
    
    auto stringSplit = ofSplitString(m_ip, ".");
    
    for(int i=0; i<stringSplit.size()-1; i++)
    {
        ipBase = ipBase + stringSplit[i] + ".";
    }
    
    for(int i=10; i<90; i++)
    {
        char _id = (char) i;
        string ip = ipBase + ofToString(i);
        m_ipList[_id] = ip;
        ofLogNotice() <<"UdpManager::receivedId -> ID: " << int(_id) << ", ip: " << ip;
        this->addConnection(_id,ip);
    }
}


void UdpManager::setupIP()
{
    #ifdef TARGET_WIN32
		system("ipfirst.cmd");
		ofFile file("my.ip");
		file >> m_ip;
		//ofLog() << "My IP: " << m_ip;

    #else
        ofxMyIP myip;
        myip.setup();
        m_ip = myip.getIpAddress();
    
    #endif
    
    ofLogNotice() <<"UdpManager::setupIP -> IP address: " << m_ip;
    
    m_broadcast = "";
    auto stringSplit = ofSplitString(m_ip, ".");
    
    for(int i=0; i<stringSplit.size(); i++){
       
        if(i<stringSplit.size()-1){
            m_broadcast += stringSplit[i];
            m_broadcast += ".";
        }
        
        char s = (char) ofToInt(stringSplit[i]);
        m_ipVector.push_back(s);
    }
    
    m_broadcast+="255";
    ofLogNotice() <<"UdpManager::setupIP -> Broadcast IP address: " << m_broadcast;
    
//    for(auto str: stringSplit){
//        char s = (char) ofToInt(str);
//        m_ipVector.push_back(s);
//        m_broadcast = str;
//        //ofLogNotice() <<"UdpManager::setupIP -> IP address: " << s;
//        
//    }
    
}
void UdpManager::setupText()
{
    
    int width =  ofGetWidth();
    int fontSize = 12;
    int height = fontSize*2;
    
    ofVec3f position;

    position.y = LayoutManager::MARGIN;
    position.x = 4*LayoutManager::MARGIN + AppManager::getInstance().getGuiManager().getWidth();
    
    string ip = AppManager::getInstance().getSettingsManager().getIpAddress();
    int portSend = AppManager::getInstance().getSettingsManager().getUdpPortSend();

    
    int porReceive = AppManager::getInstance().getSettingsManager().getUdpPortReceive();

    string text = "Local IP:" +  m_ip + ", Broadcast IP: " + m_broadcast + ", Tx Port: " + ofToString(portSend) + ", Rx Port: " + ofToString(porReceive);
    
    m_udpText =  ofPtr<TextVisual> (new TextVisual(position, width, height));
    m_udpText->setText(text, "fonts/open-sans/OpenSans-Semibold.ttf", fontSize);
    m_udpText->setColor(ofColor::white);
    m_udpText->setLineHeight(2.5);
    
    
    AppManager::getInstance().getViewManager().addOverlay(m_udpText);
}


void UdpManager::update()
{
    this->updateReveivePackage();


}

void UdpManager::updateReveivePackage()
{
    char udpMessage[UDP_MESSAGE_LENGHT];
    m_udpConnection.Receive(udpMessage,UDP_MESSAGE_LENGHT);
    string message=udpMessage;
    
    if(message!="")
    {
        //ofLogNotice() <<"UdpManager::updateReveivePackage -> SIZE " << message.size();
        //ofLogNotice() <<"UdpManager::updateReveivePackage -> message " << message;
        
        if(isMessage(udpMessage, UDP_MESSAGE_LENGHT)){
            this->parseMessage(udpMessage, UDP_MESSAGE_LENGHT);
        }
    }
}

bool UdpManager::isMessage(char * buffer, int size)
{
    if(size<UDP_MESSAGE_LENGHT){
        return false;
    }
    
    if(buffer[0] != START_COMMAND){
        return false;
    }
    
    if(buffer[1] == ID_COMMAND && buffer[3] != END_COMMAND){
        return false;
    }
       
    if(buffer[1] == HEARTBEAT_COMMAND && buffer[5] != END_COMMAND){
        return false;
    }
    
    
    string ip; int port;
    m_udpConnection.GetRemoteAddr(ip, port);
    
    ofLogNotice() <<"UdpManager::isMessage -> Received Message from: " << ip;
    
    return true;
}

void UdpManager::parseMessage(char * buffer, int size)
{
    if(size<UDP_MESSAGE_LENGHT){
        return;
    }
    
    if(buffer[1] == ID_COMMAND){
        this->receivedId(buffer[2] );
    }
    
    if(buffer[1] == HEARTBEAT_COMMAND ){
       this->receivedHeartbeat(buffer[2], buffer[3], buffer[4]);
    }
    
}

void UdpManager::receivedId(char _id)
{
    string ip; int port;
    m_udpConnection.GetRemoteAddr(ip, port);
    
    ofLogNotice() <<"UdpManager::receivedId -> Received Message from: " << ip;
    
    if(m_ipList.find(_id)==m_ipList.end())
    {
        m_ipList[_id] = ip;
        ofLogNotice() <<"UdpManager::receivedId -> ID: " << int(_id) << ", ip: " << ip;
        this->addConnection(_id,ip);
        
    }
}

void UdpManager::addConnection(char _id, string ip)
{
    shared_ptr<ofxUDPManager> udpConnection = shared_ptr<ofxUDPManager>(new ofxUDPManager());
    
    int portSend = AppManager::getInstance().getSettingsManager().getUdpPortSend();
  
    udpConnection->Create();
    udpConnection->Connect(ip.c_str(),portSend);
    udpConnection->SetNonBlocking(true);
    
    m_udpManagerMap[_id] = udpConnection;
    ofLogNotice() <<"UdpManager::addConnection -> created connnection with IP " << ip <<" to port " << portSend;
    
    this->sendLoadBitmaps(_id);

    
}
void UdpManager::receivedHeartbeat(char _id, char val1, char val2)
{
    string ip; int port;
    m_udpConnection.GetRemoteAddr(ip, port);
    
    ofLogNotice() <<"UdpManager::receivedHeartbeat -> Received Message from: " << ip;
    
    if(m_ipList.find(_id)==m_ipList.end())
    {
        m_ipList[_id] = ip;
        ofLogNotice() <<"UdpManager::receivedId -> ID: " << int(_id) << ", ip: " << ip;
        this->addConnection(_id,ip);
        
    }
}


void UdpManager::sendLoadBitmaps(char _id)
{
    UdpData data;
    data.m_bitmapNr = 0; data.m_stripNr = 0; data.m_id = (int)_id;
    this->sendLoadBitmap(data);
    
    data.m_bitmapNr = 1; data.m_stripNr = 1;
    this->sendLoadBitmap(data);
    
    data.m_bitmapNr = 1; data.m_stripNr = 2;
    this->sendLoadBitmap(data);
    
    data.m_bitmapNr = 1; data.m_stripNr = 3;
    this->sendLoadBitmap(data);
}

void UdpManager::updateReceiveText(const string& message)
{
    int porReceive = AppManager::getInstance().getSettingsManager().getUdpPortReceive();
    //string text = ">> UDP receiving -> Port: " + ofToString(porReceive) ;
    //text += "   " + message;
    //m_udpReceiveTextFont->setText(text);
//
//    m_udpReceiveMessageFont->setText("   " + message);

}

void UdpManager::sendMessage(char _id, string message)
{
    if(m_udpManagerMap.find(_id) == m_udpManagerMap.end()){
        return;
    }
    
    
    //ofLogNotice() <<"UdpManager::sendMessage << " << message;
    m_udpManagerMap[_id]->Send(message.c_str(),message.length());
}

void UdpManager::sendData(const UdpData& data)
{
    string message="";
    
    message+= START_COMMAND;
    
    char id_ = (char) ofClamp(data.m_id, 0, 254);
    message+= id_;
    
    char data_command = 1;
    message+= data_command;
    
    char strip_nr = (char) ofClamp(data.m_stripNr, 0, 254);
    message+= strip_nr;
    
    char bitmap_nr = (char) ofClamp(data.m_bitmapNr, 0, 254);
    message+= bitmap_nr;

    char height = (char) ofClamp(data.m_value, 0, 254);
    message+= height;
    
    message+= END_COMMAND;
  
    this->sendMessage(id_, message);
    //m_udpConnection.Send(message.c_str(),message.length());
    
    //ofLogNotice() <<"UdpManager::sendData << " << message;
}

void UdpManager::sendLoadBitmap(const UdpData& data)
{
    string message="";
    
    message+= START_COMMAND;
    
    char id_ = (char) ofClamp(data.m_id, 0, 254);
    message+= id_;
    
    char data_command = 0;
    message+= data_command;
    
    char strip_nr = (char) ofClamp(data.m_stripNr, 0, 254);
    message+= strip_nr;
    
    char bitmap_nr = (char) ofClamp(data.m_bitmapNr, 0, 254);
    message+= bitmap_nr;

    char clear = (char) ofClamp(data.m_value, 0, 1);
    message+= clear;
    
    message+= END_COMMAND;
    
    this->sendMessage(id_, message);
   // m_udpConnection.Send(message.c_str(),message.length());
    
    //ofLogNotice() <<"UdpManager::sendLoadBitmap << " << message;
}


void UdpManager::sendSpeed(const UdpData& data)
{
    string message="";
    
    message+= START_COMMAND;
    
    char id_ = (char) ofClamp(data.m_id, 0, 254);
    message+= id_;
    
    char data_command = 2;
    message+= data_command;
    
    char strip_nr = (char) ofClamp(data.m_stripNr, 0, 254);
    message+= strip_nr;
    
    char bitmap_nr = (char) ofClamp(data.m_bitmapNr, 0, 254);
    message+= bitmap_nr;
    
    char speed = (char) ofClamp(data.m_value, 0, 254);
    message+= speed;
    
    message+= END_COMMAND;
    
    this->sendMessage(id_, message);
    //m_udpConnection.Send(message.c_str(),message.length());
    //ofLogNotice() <<"UdpManager::sendSpeed << " << message;
}

void UdpManager::sendAutodiscovery()
{
    if(m_ipVector.size()<4){
        return;
    }
    
    string message = "";
    
    message+= START_COMMAND;
    
    message+= 'h';
    
    for(int i=0; i<4; i++)
    {
        message+=m_ipVector[i];
    }
    
    message+= END_COMMAND;
    
    m_udpConnection.Send(message.c_str(),message.length());
    
    //ofLogNotice() <<"UdpManager::sendAutodiscovery";
}






