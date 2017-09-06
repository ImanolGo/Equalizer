/*
 *  LayoutManager.cpp
 *  Light Taxes App
 *
 *  Created by Imanol Gomez on 22/08/17.
 *
 */


#include "ofMain.h"

#include "AppManager.h"
#include "SettingsManager.h"
#include "ViewManager.h"


#include "LayoutManager.h"

const int LayoutManager::MARGIN = 20;
const int LayoutManager::FRAME_MARGIN = 2;

LayoutManager::LayoutManager(): Manager()
{
	//Intentionally left empty
}


LayoutManager::~LayoutManager()
{
    ofLogNotice() <<"LayoutManager::Destructor";
}


void LayoutManager::setup()
{
	if(m_initialized)
		return;

    ofLogNotice() <<"LayoutManager::initialized";

	Manager::setup();

    this->setupFbo();
    this->setupWindowFrame();
    
    this->createTextVisuals();
    this->createSvgVisuals();
    this->createImageVisuals();

    this->addVisuals();

}



void LayoutManager::setupFbo()
{
    int margin = MARGIN;
    
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    
    m_fbo.allocate(width, height, GL_RGBA);
    m_fbo.begin(); ofClear(0); m_fbo.end();
    
}


void LayoutManager::resetWindowRect()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    float ratio = width/ height;
    float frame_width = ofGetWidth() - AppManager::getInstance().getGuiManager().getWidth() - 2*MARGIN;
    
    m_windowRect.width = frame_width- 4*MARGIN;
    m_windowRect.height =  m_windowRect.width / ratio;
    
    m_windowRect.x = AppManager::getInstance().getGuiManager().getWidth()  + 4*MARGIN;
    m_windowRect.y = ofGetHeight()*0.5 - m_windowRect.height/2;
}
void LayoutManager::setupWindowFrame()
{
    this->resetWindowRect();
    this->resetWindowFrame();
    
    float width = ofGetScreenWidth();
    float height = ofGetScreenHeight()/80;
    
    
    ofColor color = AppManager::getInstance().getSettingsManager().getColor("FrameRectangle");
    m_windowFrame.setColor(color);
    
}

void LayoutManager::resetWindowFrame()
{
    m_windowFrame.setPosition(ofPoint( m_windowRect.x - FRAME_MARGIN, m_windowRect.y - FRAME_MARGIN, 0));
    m_windowFrame.setWidth(m_windowRect.width + 2*FRAME_MARGIN); m_windowFrame.setHeight(m_windowRect.height + 2*FRAME_MARGIN);
    
}


void LayoutManager::update()
{
    this->updateColor();
}


void LayoutManager::updateColor()
{
    m_color = AppManager::getInstance().getGuiManager().getColor();
    
}

void LayoutManager::createTextVisuals()
{
    ///To implement in case we have text visuals
}

void LayoutManager::createSvgVisuals()
{
    ///To implement in case we have text visuals
}


void LayoutManager::createImageVisuals()
{
    //this->createBackground();
}

void LayoutManager::createBackground()
{
}

void LayoutManager::addVisuals()
{
    int depthLevel = -1;
    for(SvgMap::iterator it = m_svgVisuals.begin(); it!= m_svgVisuals.end(); ++it){
        AppManager::getInstance().getViewManager().addOverlay(it->second,depthLevel);
    }
    
    for(TextMap::iterator it = m_textVisuals.begin(); it!= m_textVisuals.end(); ++it){
        AppManager::getInstance().getViewManager().addOverlay(it->second,depthLevel);
    }
    
    for(ImageMap::iterator it = m_imageVisuals.begin(); it!= m_imageVisuals.end(); ++it){
        AppManager::getInstance().getViewManager().addOverlay(it->second,depthLevel);
    }
}



void LayoutManager::draw()
{
    this->drawFbo();
  
}


void LayoutManager::drawFbo()
{
    
    ofEnableAlphaBlending();
    m_fbo.begin();
    ofClear(m_color);
    
    m_fbo.end();
    ofDisableAlphaBlending();
    
    m_windowFrame.draw();
    m_fbo.draw(m_windowRect.x,m_windowRect.y,m_windowRect.width,m_windowRect.height);
}


void LayoutManager::windowResized(int w, int h)
{
    if(!m_initialized){
        return;
    }
    
    this->resetWindowRect();
    this->resetWindowFrame();
}



