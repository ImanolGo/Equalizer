/*
 *  LightSculptureManager.h
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 06/09/17.
 *
 */

#pragma once

#include "Manager.h"
#include "LightObject.h"
#include "ImageVisual.h"


//========================== class LightSculptureManager ==============================
//============================================================================
/** \class LightSculptureManager LightSculptureManager.h
 *	\brief Class managing the LEDs
 *	\details It controls the postion and color of the LEDs
 */


class LightSculptureManager: public Manager
{

    static const string LEDS_LIST_PATH;
    
    public:
    
        typedef vector<int> IntVector;
        typedef vector< ofPtr<LightObject> > LightObjectVector;
    
    public:

        //! Constructor
        LightSculptureManager();

        //! Destructor
        ~LightSculptureManager();

        //! Setup the Halo Manager
        void setup();

        //! Update the Led Manager
        void update();
    
        //! Draw the Led Manager
        void draw();
    
        const LightObjectVector& getLeds() const {return m_lightObjects;}
    
        void setPixels(ofPixelsRef pixels);
    
        void setLedColors(ofPixelsRef pixels);
    
        int getNumberLeds() const {return m_lightObjects.size();}
    
        void addLed(const ofPoint&  position);
    
        void deleteLastLed();
    
        void onSetLedsSize(float &value);
    
        void onSetBitmapNumber(int &value) {m_bitmapNumber = ofClamp(value,0,254);}
    
        void onSetStripNumber(int &value) {m_stripNumber = ofClamp(value,0,254);}
    
        void onSetSpeed(int &value);
    
        void onClearLights(bool &value);
    
        void onToggleSendHeights(bool &value) {m_sendHeights = value;}
    
        void onSetId(int &value);
    
        void onSetValue(int &value);
    
        void showChannels(bool _showChannels);

        void setBoundingBox(const ofRectangle& boundingBox);
    
    private:
    
        void setupBoundingBox();
    
        void setupLeds();
    
        void setupBackgroundImage();
    
        void createLedsPosition();
    
        void readLedsPositions();
    
        void saveLedsPositions();
    
        void normalizeLeds();
    
        bool parseLedLine(string& line, ofPoint& position);
    
        void removeCharsFromString( string &str, char* charsToRemove );
    
        void createLed(const ofPoint& position);
    
        void drawLeds();
    
        void sendHeights();
    
    
    
    private:
    
    
    
        LightObjectVector       m_lightObjects;
        ofRectangle             m_boundingBox;
        ImageVisual             m_backgroundImage;
    
        float                   m_lightObjectSize;
        int                     m_bitmapNumber;
        int                     m_stripNumber;
        bool                    m_sendHeights;
        int                     m_id;
    
};



