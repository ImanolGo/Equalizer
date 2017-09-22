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


LightSculptureManager::LightSculptureManager(): Manager(), m_lightObjectSize(20.0), m_bitmapNumber(0), m_stripNumber(0), m_sendHeights(true), m_id(0)
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
    this->setupBackgroundImage();
    
    ofLogNotice() <<"LightSculptureManager::initialized" ;
    
}

void LightSculptureManager::setupBoundingBox()
{

    float x = 10;
    float y = 10;
    float w = 90;
    float h = 90;
    
    m_boundingBox.setX(x);
    m_boundingBox.setY(y);
    m_boundingBox.setWidth(w);
    m_boundingBox.setHeight(h);
}



void LightSculptureManager::setupLeds()
{
   // this->createLedsPosition();
    this->readLedsPositions();
    //this->normalizeLeds();
}

void LightSculptureManager::setupBackgroundImage()
{
    m_backgroundImage.setResource("SculptureFloor");
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
    auto ledObject = createLed(position);
    ledObject->normalize(windowRect);
  
    ofLogNotice() <<"LightSculptureManager::addLed-> id = " <<  ledObject->getId();
}

void LightSculptureManager::deleteLastLed()
{
    if(m_lightObjects.empty()){
        return;
    }
    
    
    int latestId = -100000;
    
    for(auto lightObject: m_lightObjects){
        if(latestId < lightObject.second->getId()){
            latestId = lightObject.second->getId();
        }
    }
    
    
    m_lightObjects.erase (latestId);  // erasing by key
    ofLogNotice() <<"LightSculptureManager::deleteLastLed-> id = " << latestId;
   
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
        ofPoint pos = lightObject.second->getPosition();
        ledPosFile << "{" << pos.x << ", " << pos.y << ", 0.0}" <<std::endl;
    }
    
    ledPosFile.close();
    
    ofLogNotice() <<"LightSculptureManager::saveLedsPositions -> saved led positions to file " <<  led_position_path;
    
}


void LightSculptureManager::normalizeLeds()
{
    for (auto lightObject: m_lightObjects)
    {
        lightObject.second->normalize(m_boundingBox);
        ofLogNotice() <<"LightSculptureManager::normalized LED -> id " << lightObject.second->getId() << ", x = "  << lightObject.second->getPosition().x << ", y = "  << lightObject.second->getPosition().y;
    }
    
}


ofPtr<LightObject> LightSculptureManager::createLed(const ofPoint& position)
{
    auto lightObject = ofPtr<LightObject> (new LightObject ( position, m_lightObjects.size() + 1) );
    lightObject->setColor(ofColor::black);
    lightObject->setSize(m_lightObjectSize);
    m_lightObjects[lightObject->getId()] = lightObject;
    
    ofLogNotice() <<"LightSculptureManager::createLed -> id " << lightObject->getId() << ", x = "  << lightObject->getPosition().x << ", y = "  << lightObject->getPosition().y;
    
    return lightObject;
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


void LightSculptureManager::setHeight(int _id, float height)
{
    if(m_lightObjects.find(_id) == m_lightObjects.end()){
        return;
    }
    
    //ofLogNotice() <<"LightSculptureManager::setHeight -> id " <<  m_lightObjects[_id]->getId() << ", height = "  << height;
    m_lightObjects[_id]->setHeight(height);
}


void LightSculptureManager::setPixels(ofPixelsRef pixels)
{
    this->setLedColors(pixels);
    
    if(m_sendHeights){
         this->sendHeights();
    }
}

void LightSculptureManager::setLedColors(ofPixelsRef pixels)
{
    for(auto lightObject: m_lightObjects){
        lightObject.second->setPixelColor(pixels);
    }
}

void LightSculptureManager::sendHeights()
{
    UdpData data;
    data.m_bitmapNr = m_bitmapNumber; data.m_stripNr = m_stripNumber;
    
    for(auto lightObject: m_lightObjects){
        data.m_id = lightObject.second->getId();
        data.m_value = ofMap(lightObject.second->getColor().getBrightness(), 0, 255, 0, 254);
        AppManager::getInstance().getUdpManager().sendData(data);
    }
}

void LightSculptureManager::draw()
{
    m_backgroundImage.draw();
    this->drawLeds();
}


void LightSculptureManager::drawLeds()
{
    for(auto lightObject: m_lightObjects)
    {
        lightObject.second->draw(m_boundingBox);
    }
}


void LightSculptureManager::setBoundingBox(const ofRectangle& boundingBox)
{
    m_boundingBox = boundingBox;
   
    m_backgroundImage.setWidth(boundingBox.width); m_backgroundImage.setHeight(boundingBox.height);
    m_backgroundImage.setPosition(ofVec2f(boundingBox.x, boundingBox.y));
}

void LightSculptureManager::onSetLedsSize(float &value)
{
    m_lightObjectSize = value;
    
    for(auto lightObject: m_lightObjects){
        lightObject.second->setWidth(m_lightObjectSize);
    }
}

void LightSculptureManager::showChannels(bool _showChannels)
{
    for(auto lightObject: m_lightObjects)
    {
        lightObject.second->showId(_showChannels);
    }
}

void LightSculptureManager::onClearLights(bool& value)
{
    UdpData data; data.m_value = value; data.m_bitmapNr = m_bitmapNumber; data.m_stripNr = m_stripNumber;
    
    for(auto lightObject: m_lightObjects)
    {
        data.m_id = lightObject.second->getId();
        AppManager::getInstance().getUdpManager().sendLoadBitmap(data);
    }
}

void LightSculptureManager::onSetSpeed(int &value)
{
     UdpData data; data.m_value = ofClamp(value,0,254);
        data.m_bitmapNr = m_bitmapNumber; data.m_stripNr = m_stripNumber;
    
    for(auto lightObject: m_lightObjects)
    {
        data.m_id = lightObject.second->getId();
        AppManager::getInstance().getUdpManager().sendSpeed(data);
    }
}




void LightSculptureManager::onSetId(int &value)
{
    m_id = value;
}

void LightSculptureManager::onSetValue(int &value)
{
    UdpData data; data.m_bitmapNr = m_bitmapNumber; data.m_stripNr = m_stripNumber;
    
    data.m_id = m_id;
    data.m_value = value;
    AppManager::getInstance().getUdpManager().sendData(data);
}


//ofPtr<LightObject> LightSculptureManager::getLightObject(int _id)
//{
//    for(auto lightObject: m_lightObjects)
//    {
//        if(_id == lightObject->getId()){
//            return lightObject;
//        }
//    }
//    
//    return NULL;
//}
//


