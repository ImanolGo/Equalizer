/*
 *  GuiManager.cpp
 *  Equalizer App
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
    //this->setupLayoutGui();
    this->setupCommunicationsGui();
    this->setupNoiseGui();

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



void GuiManager::setupCommunicationsGui()
{
    auto lightSculptureManager = &AppManager::getInstance().getLightSculptureManager();
    auto udpManager = &AppManager::getInstance().getUdpManager();
    
    m_parametersCommunications.setName("Data");
    
    ofxButton * autodiscovery = new ofxButton();
    autodiscovery->setup("Autodiscovery");
    autodiscovery->addListener(udpManager, &UdpManager::sendAutodiscovery);
    m_gui.add(autodiscovery);
    
    m_comBitmapNum.set("BitMapNr", 0, 0, 10);
    m_comBitmapNum.addListener(lightSculptureManager, &LightSculptureManager::onSetBitmapNumber);
    m_parametersCommunications.add(m_comBitmapNum);

    m_comStripNum.set("StripNr", 0, 0, 3);
    m_comStripNum.addListener(lightSculptureManager, &LightSculptureManager::onSetStripNumber);
    m_parametersCommunications.add(m_comStripNum);
    
    m_comSpeed.set("Speed", 127, 0, 254);
    m_comSpeed.addListener(lightSculptureManager, &LightSculptureManager::onSetSpeed);
    m_parametersCommunications.add(m_comSpeed);
    
    m_comId.set("Id", 70, 0, 100);
    m_comId.addListener(lightSculptureManager, &LightSculptureManager::onSetId);
    m_parametersCommunications.add(m_comId);
    
    m_comValue.set("Value", 0, 0, 254);
    m_comValue.addListener(lightSculptureManager, &LightSculptureManager::onSetValue);
    m_parametersCommunications.add(m_comValue);
    
    m_comClearLights.set("Clear", false);
    m_comClearLights.addListener(lightSculptureManager, &LightSculptureManager::onClearLights);
    m_parametersCommunications.add(m_comClearLights);

    m_comSendHeights.set("SendHeights", true);
    m_comSendHeights.addListener(lightSculptureManager, &LightSculptureManager::onToggleSendHeights);
    m_parametersCommunications.add(m_comSendHeights);
//
    m_gui.add(m_parametersCommunications);
}
void GuiManager::setupLayoutGui()
{
    auto udpManager = &AppManager::getInstance().getUdpManager();
    
    m_parametersLayout.setName("Data");
    
    //m_color.setup("Color", ofColor(100, 100, 140), ofColor(0, 0), ofColor(255, 255)) ;
    m_gui.add(m_color.setup("Color", ofColor(100, 100, 140), ofColor(0, 0), ofColor(255, 255)) );
    
    
    m_id.set("ID", 0, 0, 512);
    //m_id.addListener(udpManager, &UdpManager::onSetId);
    m_parametersLayout.add(m_id);
    
    m_gui.add(m_parametersLayout);

}

void GuiManager::setupNoiseGui()
{
    auto noiseManager = &AppManager::getInstance().getNoiseManager();
    
    m_parametersNoise.setName("Noise");
    
    m_noiseResolution.set("Noise Resolution",  64, 2, 256 );
    m_noiseResolution.addListener(noiseManager, &NoiseManager::onNoiseResolutionChange);
    m_parametersNoise.add(m_noiseResolution);
    
    m_noiseFrequency.set("Noise Frequency",  0.4, 0.0, 4.0);
    m_noiseFrequency.addListener(noiseManager, &NoiseManager::onNoiseFrequencyChange);
    m_parametersNoise.add(m_noiseFrequency);
    
    m_noiseSpeed.set("Noise Speed",  1.0, 0.001, 3);
    m_noiseSpeed.addListener(noiseManager, &NoiseManager::onNoiseSpeedChange);
    m_parametersNoise.add(m_noiseSpeed);
    
    
    m_gui.add(m_parametersNoise);
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
