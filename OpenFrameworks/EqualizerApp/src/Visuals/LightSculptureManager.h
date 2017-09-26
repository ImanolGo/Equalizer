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
    
        typedef ofPtr<LightObject> LightObjecPtr;
        typedef map< int , LightObjecPtr > LightObjectMap;
    
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
    
        //const LightObjectMap& getLeds() const {return m_lightObjects;}
    
        //LightObjecPtr getLightObject(int _id);
    
        void setPixels(ofPixelsRef pixels);
    
        void setHeight(int _id, float height);
    
        void addNoise(ofPixelsRef pixels);
    
        void setLedColors(ofPixelsRef pixels);
    
        int getNumberLeds() const {return m_lightObjects.size();}
    
        void addLed(const ofPoint&  position);
    
        void deleteLastLed();
    
        void onSetLedsSize(float &value);
    
        void onSetBitmapNumber(int &value) {m_bitmapNumber = ofClamp(value,0,254);}
    
        void onSetStripNumber(int &value) {m_stripNumber = ofClamp(value,0,254);}
    
        void onSetSpeed(int &value);
    
        void onClearLights(bool value);
    
        void onToggleSendHeights(bool value) {m_sendHeights = value;}
    
        void onSetId(int &value);
    
        void onSetValue(int &value);
    
        void showChannels(bool _showChannels);

        void setBoundingBox(const ofRectangle& boundingBox);
    
        void onToggleShowIds();
    
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
    
        LightObjecPtr createLed(const ofPoint& position);
    
        void drawLeds();
    
        void sendHeights();
    
    
    
    private:
    
    
    
        LightObjectMap          m_lightObjects;
        ofRectangle             m_boundingBox;
        ImageVisual             m_backgroundImage;
    
        float                   m_lightObjectSize;
        int                     m_bitmapNumber;
        int                     m_stripNumber;
        bool                    m_sendHeights;
        int                     m_id;
    
};



