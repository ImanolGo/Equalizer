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
    
        //! Draw the Led Manager according to a certain width or height
        void draw(int width, int height);
    
        const LightObjectVector& getLeds() const {return m_lightObjects;}
    
        void setPixels(ofPixelsRef pixels);
    
        void setLedColors(ofPixelsRef pixels);
    
        int getNumberLeds() const {return m_lightObjects.size();}
    
        void addLed(const ofPoint&  position);
    
        void deleteLastLed();
    
        void onSetLedsSize(float &value);
    
        void showChannels(bool _showChannels);
    
    private:
    
        void setupBoundingBox();
    
        void setupLeds();
    
        void createLedsPosition();
    
        void readLedsPositions();
    
        void saveLedsPositions();
    
        void normalizeLeds();
    
        bool parseLedLine(string& line, ofPoint& position);
    
        void removeCharsFromString( string &str, char* charsToRemove );
    
        void createLed(const ofPoint& position);
    
        void drawLeds(int width = 1, int height = 1);
    
    
    
    private:
    
    
    
        LightObjectVector       m_lightObjects;
        ofRectangle             m_boundingBox;
    
        float           m_lightObjectSize;
    
};



