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

    
 private:
    
 
    ofxUDPManager          m_udpConnection;        ///< ofxUdpManager  class
    ofPtr<TextVisual>      m_udpReceiveTextFont;
    ofPtr<TextVisual>      m_udpReceiveMessageFont;
    unsigned int            m_id;
    ofColor                 m_color;
    string                  m_ip;
    string                  m_broadcast;
    vector<char>            m_ipVector;
    
    
};

