/*
 *  LightObject.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 06/09/17.
 *
 */

#include "LightObject.h"


const int LightObject::SIZE = 20;

LightObject::LightObject(const ofPoint& position, int id): BasicVisual(position, SIZE, SIZE), m_id(id), m_showId(true)
{
    this->setup();
}

LightObject::~LightObject()
{
    //Intentionaly left empty
}

void LightObject::setup()
{
   // this->setupImages();
    this->setupText();
}


void LightObject::setupImages()
{
    ofVec3f position(0,0);
    string resourceName = "brush";
    m_image = ofPtr<ImageVisual> (new ImageVisual(m_position,resourceName, true));
}

void LightObject::setupText()
{
    
    ofVec3f position(0,0);
    float fontSize = m_width;
    string text = ofToString(m_id);
    string fontName ="fonts/open-sans/OpenSans-Bold.ttf";
    ofColor textColor = ofColor::white;
    
    m_idText = ofPtr<TextVisual> (new TextVisual(position,2*m_width,m_height, true));
    m_idText->setText(text,fontName,fontSize,textColor);
    
}


void LightObject::draw()
{
    ofPushMatrix();
    ofPushStyle();
    
    ofTranslate(m_position);
    ofScale(m_scale.x, m_scale.y);
    //ofTranslate(-m_width*0.5,-m_width*0.5);
    
    ofRotateX(m_rotation.x);
    ofRotateY(m_rotation.y);
    
    
    ofSetCircleResolution(100);
    ofFill();
    
    //ofRect(0, 0, m_width, m_height);
    ofSetColor(255);
    ofDrawCircle(0, 0, m_width);
    ofSetColor(m_color);
    ofDrawCircle(0, 0, m_width*0.9);
    
    ofPopStyle();
    
    if(m_showId){
        m_idText->draw();
    }
    ofPopMatrix();
}

void LightObject::draw(const ofRectangle& boundingBox)
{
    
    ofPushMatrix();
    float x = boundingBox.x + m_position.x * boundingBox.width;
    float y = boundingBox.y + m_position.y * boundingBox.height;
    ofTranslate(x, y);
    this->draw();
    ofPopMatrix();
}

void LightObject::normalize(const ofRectangle& boundingBox)
{
    m_position.x = (m_position.x - boundingBox.getX()) / boundingBox.getWidth();
    m_position.y = (m_position.y - boundingBox.getY()) / boundingBox.getHeight();
}


void LightObject::setPixelColor(ofPixelsRef pixels)
{
    m_color = pixels.getColor(m_position.x * pixels.getWidth(), m_position.y * pixels.getHeight());
    int brightness = m_color.getBrightness();
    //m_color = ofColor( 255, 194, 0);
    m_color = ofColor::white;
    m_color.setBrightness(brightness);
    //m_color = ofColor(brightness);
}


void LightObject::setHeight(float height)
{
    m_color = ofColor::white;
    int brightness = ofMap(height, 0.0, 1.0, 30, 255, true);
    m_color.setBrightness(brightness);
    
    //ofLogNotice() <<"LightObject::setHeight-> id = " <<  this->getId() << ", brightness = " << brightness;
}

void LightObject::setSize(int size){
    setWidth(size);
    this->setupText();
}

