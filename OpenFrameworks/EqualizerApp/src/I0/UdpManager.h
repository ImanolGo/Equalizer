/*
 *  UdpManager.h
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 22/08/17.
 *
 */


#pragma once

#include "ofMain.h"
#include "Manager.h"
#include "ofxNetwork.h"
#include "TextVisual.h"




//=========================== UdpData =======================================
//===========================================================================


typedef struct UdpData
{
    UdpData()
    : m_id(0), m_value(0), m_bitmapNr(0),m_stripNr(0)
    {
        // Do nothing
    }
    int m_id;
    int m_value;
    int m_bitmapNr;
    int m_stripNr;
} UdpData;



//========================== class UdpManager =======================================
//==============================================================================
/** \class UdpManager UdpManager.h
 *	\brief class for managing the UDP messages
 *	\details It reads all the UDP messages and create the proper application events
 */


class UdpManager: public Manager
{

    static const int UDP_MESSAGE_LENGHT; ///Defines the Udp"s message length
    static const char START_COMMAND; ///Defines the start command byte
    static const char END_COMMAND; ///Defines the end command byte
    static const char ID_COMMAND; ///Defines the id command byte
    static const char HEARTBEAT_COMMAND; ///Defines the end command byte
    

public:
    //! Constructor
    UdpManager();

    //! Destructor
    virtual ~UdpManager();

    //! setups the manager
    void setup();

    //! updates the manager
    void update();
    
    void sendAutodiscovery();
    
    void sendData(const UdpData& data);
    
    void sendSpeed(const UdpData& data);
    
    void sendLoadBitmap(const UdpData& data);

private:
    
    //! sets up the udp
    void setupUdpConnection();
    
    void setupIP();
    
    //! setups the text visuals
    void setupText();
    
    //! updates receiving information text visuals
    void updateReceiveText(const string& message);
    
    void updateReveivePackage();
    
    bool isMessage(char * buffer, int size);
    
    void parseMessage(char * buffer, int size);
    
    void receivedId(char _id);
    
    void receivedHeartbeat(char _id, char val1, char val2);
    
    void addConnection(char _id, string ip);
    
    void sendMessage(char _id, string message);
    
    void createConnections();

    
 private:
    
    typedef               map<char, string>     IpMap;  ///< defines a map of ip addresses defined by a unique id
    typedef               map<char, shared_ptr<ofxUDPManager>>     UdpManagerMap;  ///< defines a vector of UDP managers
    
    ofxUDPManager          m_udpConnection;        ///< ofxUdpManager  class
    ofPtr<TextVisual>      m_udpText;
    
    UdpManagerMap           m_udpManagerMap;
    
    unsigned int            m_id;
    ofColor                 m_color;
    string                  m_ip;
    string                  m_broadcast;
    vector<char>            m_ipVector;
    
    IpMap                   m_ipList;
    
    
};

