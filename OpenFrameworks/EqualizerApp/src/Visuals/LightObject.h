/*
 *  LightObject.h
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 06/09/17.
 *
 */


#pragma once

#include "ofMain.h"
#include "BasicVisual.h"
#include "TextVisual.h"
#include "ImageVisual.h"


class LightObject: public BasicVisual {
    
    static const int SIZE;
    
public:
    
    LightObject(const ofPoint& position, int id);
    
    virtual ~LightObject();
    
    void draw();
    
    void draw(const ofRectangle& boundingBox);
    
    int getId() const {return m_id;}
    
    void normalize(const ofRectangle& boundingBox);
    
    void setPixelColor(ofPixelsRef pixels);
    
    void showId(bool _showId) {m_showId = _showId;}
    
    void setSize(int size);
    
    void setHeight(float height);
    
private:
    
    void setup();
    
    void setupImages();
    
    void setupText();
    
private:
    
    int m_id;
    ofPtr<TextVisual>   m_idText;
    ofPtr<ImageVisual>  m_image;
    bool        m_showId;
};




