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

private:
    
    //! sets up the udp receiver
    void setupUdpReceiver();
    
    void setupIP();
    
    //! setups the text visuals
    void setupText();
    
    //! updates receiving information text visuals
    void updateReceiveText(const string& message);
    
    void sendData(int id, int value, int bitmapNr);
    
    void sendSpeed(int id, int value, int bitmapNr);
    
    void sendLoadBitmap(int id, int bitmapNr);
    
 private:
    
 
    ofxUDPManager          m_udpConnection;        ///< ofxUdpManager  class
    ofPtr<TextVisual>      m_udpReceiveTextFont;
    ofPtr<TextVisual>      m_udpReceiveMessageFont;
    unsigned int            m_id;
    ofColor                 m_color;
    string                  m_ip;
    vector<char>            m_ipVector;
    
    
};

