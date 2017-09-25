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
#include "GuiTheme.h"


const string GuiManager::GUI_SETTINGS_FILE_NAME = "xmls/GuiSettings.xml";
const string GuiManager::GUI_SETTINGS_NAME = "GUI";
const int GuiManager::GUI_WIDTH = 500;


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
    this->setupTaxGui();
    //this->setupCommunicationsGui();
    //this->setupNoiseGui();

    //this->loadGuiValues();

    
    ofLogNotice() <<"GuiManager::initialized";
    
}

void GuiManager::setupGuiParameters()
{
//    m_gui.setDefaultWidth(GUI_WIDTH);
//    m_gui.setup(GUI_SETTINGS_NAME, GUI_SETTINGS_FILE_NAME);
//    //m_gui.setPosition(ofGetWidth() - GUI_WIDTH - 20, 40);
//    m_gui.setPosition(20, 20);
//    m_gui.add(m_guiFPS.set("FPS", 0, 0, 60));
//    ofxGuiSetFont( "fonts/open-sans/OpenSans-Semibold.ttf", 9 );
    
    m_gui.setPosition(ofxDatGuiAnchor::TOP_LEFT);
    //m_gui.setAssetPath(ofToDataPath("fonts/"));
    //m_gui.setAssetPath("../Resources/data/fonts/");
    m_gui.setTheme(new GuiTheme());
    
    
    int margin =  LayoutManager::MARGIN;
    m_gui.setAutoDraw(false);
    auto pos = m_gui.getPosition();
    m_gui.setPosition(pos.x + margin, pos.y + 2*margin);
   // m_gui.addHeader(GUI_SETTINGS_NAME, true);
    
    // add some components //
    //m_gui.addLabel("PrimaveraSound GUI");
    
    m_gui.addFRM();
    
    m_gui.addBreak();


}

void GuiManager::setupTaxGui()
{
    
    auto taxManager = &AppManager::getInstance().getTaxManager();

    m_parametersTaxes.setName("Taxes");
    
    m_taxBasicIncome.set("Basic Income", 0, 0, 20000);
    m_taxBasicIncome.addListener(taxManager, &TaxManager::onSetBasicIncome);
    //m_parametersTaxes.add(m_taxBasicIncome);
    
    m_directTax.set("Direct Tax", 20, 0, 100);
    m_directTax.addListener(taxManager, &TaxManager::onSetDirectTaxRate);
   // m_parametersTaxes.add(m_directTax);
    
    m_basicRate.set("Basic Rate", 20, 0, 100);
    m_basicRate.addListener(taxManager, &TaxManager::onSetBasicTaxRate);
   // m_parametersTaxes.add(m_basicRate);
    
    m_higherRate.set("Higher Rate", 40, 0, 100);
    m_higherRate.addListener(taxManager, &TaxManager::onSetHigherTaxRate);
   // m_parametersTaxes.add(m_higherRate);
    
    m_additionalRate.set("Additional Rate", 45, 0, 100);
    m_additionalRate.addListener(taxManager, &TaxManager::onSetAdditionalTaxRate);
   // m_parametersTaxes.add(m_additionalRate);
    
    
    // add a folder to group a few components together //
    ofxDatGuiFolder* folder = m_gui.addFolder("TAXES", ofColor::cyan);
     folder->addSlider(m_taxBasicIncome);
    folder->addSlider(m_directTax);
    folder->addSlider(m_basicRate);
    folder->addSlider(m_higherRate);
    folder->addSlider(m_additionalRate);
    folder->expand();
    
    
//
//    m_gui.add(m_parametersTaxes);
}


void GuiManager::setupCommunicationsGui()
{
//    auto lightSculptureManager = &AppManager::getInstance().getLightSculptureManager();
//    auto udpManager = &AppManager::getInstance().getUdpManager();
//    
//    m_parametersCommunications.setName("Data");
//    
//    ofxButton * autodiscovery = new ofxButton();
//    autodiscovery->setup("Autodiscovery");
//    autodiscovery->addListener(udpManager, &UdpManager::sendAutodiscovery);
//    m_gui.add(autodiscovery);
//    
//    m_comBitmapNum.set("BitMapNr", 0, 0, 10);
//    m_comBitmapNum.addListener(lightSculptureManager, &LightSculptureManager::onSetBitmapNumber);
//    m_parametersCommunications.add(m_comBitmapNum);
//
//    m_comStripNum.set("StripNr", 0, 0, 3);
//    m_comStripNum.addListener(lightSculptureManager, &LightSculptureManager::onSetStripNumber);
//    m_parametersCommunications.add(m_comStripNum);
//    
//    m_comSpeed.set("Speed", 127, 0, 254);
//    m_comSpeed.addListener(lightSculptureManager, &LightSculptureManager::onSetSpeed);
//    m_parametersCommunications.add(m_comSpeed);
//    
//    m_comId.set("Id", 70, 0, 100);
//    m_comId.addListener(lightSculptureManager, &LightSculptureManager::onSetId);
//    m_parametersCommunications.add(m_comId);
//    
//    m_comValue.set("Value", 0, 0, 254);
//    m_comValue.addListener(lightSculptureManager, &LightSculptureManager::onSetValue);
//    m_parametersCommunications.add(m_comValue);
//    
//    m_comClearLights.set("Clear", false);
//    m_comClearLights.addListener(lightSculptureManager, &LightSculptureManager::onClearLights);
//    m_parametersCommunications.add(m_comClearLights);
//
//    m_comSendHeights.set("SendHeights", true);
//    m_comSendHeights.addListener(lightSculptureManager, &LightSculptureManager::onToggleSendHeights);
//    m_parametersCommunications.add(m_comSendHeights);
////
//    m_gui.add(m_parametersCommunications);
}
void GuiManager::setupLayoutGui()
{
//    auto udpManager = &AppManager::getInstance().getUdpManager();
//    
//    m_parametersLayout.setName("Data");
//    
//    //m_color.setup("Color", ofColor(100, 100, 140), ofColor(0, 0), ofColor(255, 255)) ;
//    m_gui.add(m_color.setup("Color", ofColor(100, 100, 140), ofColor(0, 0), ofColor(255, 255)) );
//    
//    
//    m_id.set("ID", 0, 0, 512);
//    //m_id.addListener(udpManager, &UdpManager::onSetId);
//    m_parametersLayout.add(m_id);
//    
//    m_gui.add(m_parametersLayout);

}

void GuiManager::setupNoiseGui()
{
//    auto noiseManager = &AppManager::getInstance().getNoiseManager();
//    
//    m_parametersNoise.setName("Noise");
//    
//    m_noiseResolution.set("Noise Resolution",  64, 2, 256 );
//    m_noiseResolution.addListener(noiseManager, &NoiseManager::onNoiseResolutionChange);
//    m_parametersNoise.add(m_noiseResolution);
//    
//    m_noiseFrequency.set("Noise Frequency",  0.4, 0.0, 4.0);
//    m_noiseFrequency.addListener(noiseManager, &NoiseManager::onNoiseFrequencyChange);
//    m_parametersNoise.add(m_noiseFrequency);
//    
//    m_noiseSpeed.set("Noise Speed",  1.0, 0.001, 3);
//    m_noiseSpeed.addListener(noiseManager, &NoiseManager::onNoiseSpeedChange);
//    m_parametersNoise.add(m_noiseSpeed);
//    
//    
//    m_gui.add(m_parametersNoise);
}

void GuiManager::update()
{
    m_gui.update();
}


void GuiManager::draw()
{
    if(!m_showGui)
        return;
    
    this->drawRectangle();
    
    ofEnableSmoothing();
    ofEnableAlphaBlending();
        m_gui.draw();
    ofDisableAlphaBlending();
    ofDisableSmoothing();
    
}


void GuiManager::saveGuiValues()
{
//    ofXml xml;
//    xml.serialize(m_parameters);
//    xml.save(GUI_SETTINGS_FILE_NAME);
}

void GuiManager::loadGuiValues()
{
//   m_gui.loadFromFile(GUI_SETTINGS_FILE_NAME);
}


void GuiManager::toggleGui()
{
    m_showGui = !m_showGui;
}

void GuiManager::drawRectangle()
{
    ofPushStyle();
    ofSetColor(ofColor::black);
    ofDrawRectangle( m_gui.getPosition().x - 20, 0, GUI_WIDTH + 60, ofGetHeight());
    ofPopStyle();
}
