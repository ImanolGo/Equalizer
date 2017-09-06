/*
 *  GuiManager.cpp
 *  Light Taxes App
 *
 *  Created by Imanol Gomez on 22/08/17.
 *
 */

#include "ofMain.h"

#include "AppManager.h"

#include "GuiManager.h"


const string GuiManager::GUI_SETTINGS_FILE_NAME = "xmls/GuiSettings.xml";
const string GuiManager::GUI_SETTINGS_NAME = "HeroDress";
const int GuiManager::GUI_WIDTH = 200;


GuiManager::GuiManager(): Manager(), m_showGui(true)
{
	//Intentionally left empty
}


GuiManager::~GuiManager()
{
    this->saveGuiValues();
    ofLogNotice() <<"GuiManager::Destructor";
}


void GuiManager::setup()
{
	if(m_initialized)
		return;
    
    Manager::setup();


    this->setupGuiParameters();
    this->setupLayoutGui();

    this->loadGuiValues();
    
    ofLogNotice() <<"GuiManager::initialized";
    
}

void GuiManager::setupGuiParameters()
{
    m_gui.setDefaultWidth(GUI_WIDTH);
    m_gui.setup(GUI_SETTINGS_NAME, GUI_SETTINGS_FILE_NAME);
    //m_gui.setPosition(ofGetWidth() - GUI_WIDTH - 20, 40);
    m_gui.setPosition(20, 20);
    m_gui.add(m_guiFPS.set("FPS", 0, 0, 60));
    ofxGuiSetFont( "fonts/open-sans/OpenSans-Semibold.ttf", 9 );

}



void GuiManager::setupLayoutGui()
{
    auto udpManager = &AppManager::getInstance().getUdpManager();
    
    m_parametersLayout.setName("Data");
    
    //m_color.setup("Color", ofColor(100, 100, 140), ofColor(0, 0), ofColor(255, 255)) ;
    m_gui.add(m_color.setup("Color", ofColor(100, 100, 140), ofColor(0, 0), ofColor(255, 255)) );
    
    
    m_id.set("ID", 0, 0, 512);
    m_id.addListener(udpManager, &UdpManager::onSetId);
    m_parametersLayout.add(m_id);
    
    m_gui.add(m_parametersLayout);

}



void GuiManager::draw()
{
    if(!m_showGui)
        return;
    
    this->drawRectangle();
    
    m_guiFPS = ofGetFrameRate();
    m_gui.draw();
    
}


void GuiManager::saveGuiValues()
{
    m_gui.saveToFile(GUI_SETTINGS_FILE_NAME);
}

void GuiManager::loadGuiValues()
{
    m_gui.loadFromFile(GUI_SETTINGS_FILE_NAME);
}


void GuiManager::toggleGui()
{
    m_showGui = !m_showGui;
}

void GuiManager::drawRectangle()
{
    ofPushStyle();
    ofSetColor(ofColor::black);
    ofRect( m_gui.getPosition().x - 20, 0, GUI_WIDTH + 60, ofGetHeight());
    ofPopStyle();
}
