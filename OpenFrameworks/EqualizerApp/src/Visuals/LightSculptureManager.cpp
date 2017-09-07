/*
 *  LightSculptureManager.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 06/09/17.
 *
 */


#include "ofMain.h"

#include "LightSculptureManager.h"
#include "AppManager.h"


const string LightSculptureManager::LEDS_LIST_PATH = "leds/";


LightSculptureManager::LightSculptureManager(): Manager(), m_lightObjectSize(20.0), m_bitmapNumber(0), m_stripNumber(0)
{
	//Intentionally left empty
}


LightSculptureManager::~LightSculptureManager()
{
    this->saveLedsPositions();
    ofLogNotice() <<"LightSculptureManager::Destructor" ;
}


void LightSculptureManager::setup()
{
	if(m_initialized)
		return;


	Manager::setup();
    
    this->setupBoundingBox();
    this->setupLeds();
    
    ofLogNotice() <<"LightSculptureManager::initialized" ;
    
}

void LightSculptureManager::setupBoundingBox()
{
//    m_boundingBox.setX(166.081);
//    m_boundingBox.setY(362.7);
//    m_boundingBox.setWidth(401.301 - m_boundingBox.getX());
//    m_boundingBox.setHeight(706.770 - m_boundingBox.getY());
    
    m_boundingBox.setX(166.081);
    m_boundingBox.setY(362.7);
    m_boundingBox.setWidth(401.301 - m_boundingBox.getX());
    m_boundingBox.setHeight(706.770 - m_boundingBox.getY());
}



void LightSculptureManager::setupLeds()
{
    this->createLedsPosition();
    //this->readLedsPositions();
    //this->normalizeLeds();
}

void LightSculptureManager::createLedsPosition()
{
    float x_offset = 0.1;
    float y_offset = 0.1;
    int num_rows = 9;
    int num_cols = 8;
    
    float w = (1.0 - 2.0*x_offset)/(num_cols-1);
    float h = (1.0 - 2.0*y_offset)/(num_rows-1);
    
    for(int i = 0; i< num_rows; i++){
        for(int j = 0; j< num_cols; j++){
            
            float x = x_offset + j*w;
            float y = y_offset + i*h;
            
            ofPoint ledPosition(x,y,0.0);
            createLed(ledPosition);
        }
    }
}

void LightSculptureManager::addLed(const ofPoint& position)
{
    ofRectangle windowRect = AppManager::getInstance().getLayoutManager().getWindowRect();
    createLed(position);
    
    if (!m_lightObjects.empty()) {
        m_lightObjects.back()->normalize(windowRect);
    }
    
    ofLogNotice() <<"LightSculptureManager::addLed-> id = " <<  m_lightObjects.back()->getId();
}

void LightSculptureManager::deleteLastLed()
{
    if(!m_lightObjects.empty()){
        int id = m_lightObjects.back()->getId();
        m_lightObjects.pop_back();

        ofLogNotice() <<"LightSculptureManager::deleteLastLed-> id = " << id;
    }
}

void LightSculptureManager::readLedsPositions()
{
    
    string led_position_path = LEDS_LIST_PATH + "LedPositions.txt";
    ofBuffer buffer = ofBufferFromFile(led_position_path);
    
    
    if(buffer.size())
    {
        for (ofBuffer::Line it = buffer.getLines().begin(), end = buffer.getLines().end(); it != end; ++it)
        {
            string line = *it;
            ofPoint ledPosition;
            
            if(parseLedLine(line,ledPosition))
            {
                createLed(ledPosition);
            }
            
        }
    }
    
}


void LightSculptureManager::saveLedsPositions()
{
     string led_position_path = LEDS_LIST_PATH + "LedPositions.txt";
     ofFile ledPosFile(led_position_path, ofFile::WriteOnly, true);
    
    for(auto lightObject: m_lightObjects)
    {
        ofPoint pos = lightObject->getPosition();
        ledPosFile << "{" << pos.x << ", " << pos.y << ", 0.0}" <<std::endl;
    }
    
    ledPosFile.close();
    
    ofLogNotice() <<"LightSculptureManager::saveLedsPositions -> saved led positions to file " <<  led_position_path;
    
}


void LightSculptureManager::normalizeLeds()
{
    for (auto led: m_lightObjects)
    {
        led->normalize(m_boundingBox);
        ofLogNotice() <<"LightSculptureManager::normalized LED -> id " << led->getId() << ", x = "  << led->getPosition().x << ", y = "  << led->getPosition().y;
    }
    
}


void LightSculptureManager::createLed(const ofPoint& position)
{
    auto lightObject = ofPtr<LightObject> (new LightObject ( position, m_lightObjects.size() + 1) );
    lightObject->setColor(ofColor::black);
    lightObject->setSize(m_lightObjectSize);
    m_lightObjects.push_back(lightObject);

    
    ofLogNotice() <<"LightSculptureManager::createLed -> id " << lightObject->getId() << ", x = "  << lightObject->getPosition().x << ", y = "  << lightObject->getPosition().y;
}

bool LightSculptureManager::parseLedLine(string& line, ofPoint& position)
{
    if(line.size() == 0){
        return false;
    }

    char chars[] = "{}";
    removeCharsFromString(line, chars);
    vector <string> strings = ofSplitString(line, ", " );
    
    position.x = ofToFloat(strings[0]);
    position.y = ofToFloat(strings[1]);
    position.z = ofToFloat(strings[2]);
    
    return true;
}

void LightSculptureManager::removeCharsFromString( string &str, char* charsToRemove ) {
    for ( unsigned int i = 0; i < strlen(charsToRemove); ++i ) {
        str.erase( remove(str.begin(), str.end(), charsToRemove[i]), str.end() );
    }
}

void LightSculptureManager::update()
{
    //
}

void LightSculptureManager::setPixels(ofPixelsRef pixels)
{
    this->setLedColors(pixels);
}

void LightSculptureManager::setLedColors(ofPixelsRef pixels)
{
    for(auto led: m_lightObjects){
        led->setPixelColor(pixels);
    }
}


void LightSculptureManager::draw()
{
    this->drawLeds();
}

void LightSculptureManager::draw(int width, int height)
{
    this->drawLeds(width, height);
}

void LightSculptureManager::drawLeds(int width, int height)
{
    for(auto led: m_lightObjects)
    {
        led->draw(width,height);
    }
}

void LightSculptureManager::onSetLedsSize(float &value)
{
    m_lightObjectSize = value;
    
    for(auto lightObject: m_lightObjects){
        lightObject->setWidth(m_lightObjectSize);
    }
}

void LightSculptureManager::showChannels(bool _showChannels)
{
    for(auto lightObject: m_lightObjects)
    {
        lightObject->showId(_showChannels);
    }
}

void LightSculptureManager::onClearLights(bool& value)
{
}






