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


GuiManager::GuiManager(): Manager(), m_showGui(true), m_folder(NULL)
{
	//Intentionally left empty
}


GuiManager::~GuiManager()
{
    this->saveGuiValues();
    ofLogNotice() <<"GuiManager::Destructor";
	delete m_folder;
}


void GuiManager::setup()
{
	if(m_initialized)
		return;
    
    Manager::setup();


    this->setupGuiParameters();
    //this->setupLayoutGui();
    this->setupTaxGui();
    this->setupCommunicationsGui();
    //this->setupNoiseGui();

    this->setupGuiEvents();
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
    
    ofxDatGuiLog::quiet();
    
    m_gui.setPosition(ofxDatGuiAnchor::TOP_LEFT);
    //m_gui.setAssetPath(ofToDataPath("fonts/"));
    //m_gui.setAssetPath("../Resources/data/fonts/");
    m_gui.setTheme(new GuiTheme());
    
    
    int margin =  LayoutManager::MARGIN;
    m_gui.setAutoDraw(false);
    auto pos = m_gui.getPosition();
    m_gui.setPosition(pos.x + margin, pos.y + 10*margin);
   // m_gui.addHeader(GUI_SETTINGS_NAME, true);
    
    // add some components //
    //m_gui.addLabel("PrimaveraSound GUI");
    
    //m_gui.addFRM();
    
    //m_gui.addBreak();


}

void GuiManager::setupTaxGui()
{
    
    auto taxManager = &AppManager::getInstance().getTaxManager();

    
    m_taxBasicIncome.set("Universal Income", 0, 0, 20000);
    m_taxBasicIncome.addListener(taxManager, &TaxManager::onSetBasicIncome);
    m_parameters.add(m_taxBasicIncome);
    
    m_directTax.set("Direct Tax", 20, 0, 100);
    m_directTax.addListener(taxManager, &TaxManager::onSetDirectTaxRate);
    m_parameters.add(m_directTax);
    
    m_basicRate.set("Basic Rate", 20, 0, 100);
    m_basicRate.addListener(taxManager, &TaxManager::onSetBasicTaxRate);
    m_parameters.add(m_basicRate);
    
    m_higherRate.set("Higher Rate", 40, 0, 100);
    m_higherRate.addListener(taxManager, &TaxManager::onSetHigherTaxRate);
    m_parameters.add(m_higherRate);
    
    m_additionalRate.set("Additional Rate", 45, 0, 100);
    m_additionalRate.addListener(taxManager, &TaxManager::onSetAdditionalTaxRate);
    m_parameters.add(m_additionalRate);
    
    
    // add a folder to group a few components together //
	m_folder = m_gui.addFolder("TAXES", ofColor::cyan);
	m_folder->addSlider(m_taxBasicIncome);
	m_folder->addSlider(m_directTax);
	m_folder->addSlider(m_basicRate);
	m_folder->addSlider(m_higherRate);
	m_folder->addSlider(m_additionalRate);

	if (!AppManager::getInstance().getSettingsManager().getDebugMode()) {
		m_folder->expand();
	}
	else {
		m_folder->collapse();
	}


	
//
//    m_gui.add(m_parametersTaxes);
}


void GuiManager::setupCommunicationsGui()
{
    auto lightSculptureManager = &AppManager::getInstance().getLightSculptureManager();
    auto udpManager = &AppManager::getInstance().getUdpManager();
    
    
    m_comBitmapNum.set("BitMapNr", 0, 0, 10);
    m_comBitmapNum.addListener(lightSculptureManager, &LightSculptureManager::onSetBitmapNumber);
    m_parameters.add(m_comBitmapNum);

    m_comStripNum.set("StripNr", 0, 0, 3);
    m_comStripNum.addListener(lightSculptureManager, &LightSculptureManager::onSetStripNumber);
    m_parameters.add(m_comStripNum);
    
    m_comSpeed.set("Speed", 127, 0, 254);
    m_comSpeed.addListener(lightSculptureManager, &LightSculptureManager::onSetSpeed);
    
    m_comId.set("Id", 1, 1, 76);
    m_comId.addListener(lightSculptureManager, &LightSculptureManager::onSetId);

    m_comValue.set("Value", 0, 0, 139);
    m_comValue.addListener(lightSculptureManager, &LightSculptureManager::onSetValue);
    m_parameters.add(m_comValue);
    
	ofxDatGuiFolder*folder = m_gui.addFolder("COMMUNICATIONS", ofColor::white);
    folder->addButton("Autodiscovery");
    folder->addSlider(m_comBitmapNum);
    folder->addSlider(m_comStripNum);
    folder->addSlider(m_comSpeed);
    folder->addSlider(m_comId);
    folder->addSlider(m_comValue);
    folder->addToggle("Clear");
    auto toggle = folder->addToggle("SendHeights");
    
    folder->expand();
    
    m_gui.addBreak();

	if (!AppManager::getInstance().getSettingsManager().getDebugMode()) {
		folder->setVisible(false);
	}
	else {
		toggle->setChecked(false);
		AppManager::getInstance().getLightSculptureManager().onToggleSendHeights(false);
	}

	toggle = NULL;

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
	this->updateFolder();
}


void GuiManager::updateFolder()
{
	if (!m_folder) {
		return;
	}

	if (AppManager::getInstance().getSettingsManager().getDebugMode()) {
		return;
	}
	if (!m_folder->getIsExpanded()) {
		m_folder->expand();
	}
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


void GuiManager::setupGuiEvents()
{
    m_gui.onDropdownEvent(this, &GuiManager::onDropdownEvent);
    m_gui.onColorPickerEvent(this, &GuiManager::onColorPickerEvent);
    m_gui.onButtonEvent(this, &GuiManager::onButtonEvent);
    m_gui.onToggleEvent(this, &GuiManager::onToggleEvent);
    m_gui.onMatrixEvent(this, &GuiManager::onMatrixEvent);
}


void GuiManager::saveGuiValues()
{
    ofXml xml;
    xml.serialize(m_parameters);
    xml.save(GUI_SETTINGS_FILE_NAME);
}

void GuiManager::loadGuiValues()
{
    ofXml xml(GUI_SETTINGS_FILE_NAME);
    xml.deserialize(m_parameters);
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



void GuiManager::onDropdownEvent(ofxDatGuiDropdownEvent e)
{
    cout << "onDropdownEvent: " << e.target->getName() << " Selected" << endl;
    
}

void GuiManager::onColorPickerEvent(ofxDatGuiColorPickerEvent e)
{
    cout << "onColorPickerEvent: " << e.target->getName() << " Selected" << endl;
    
    
}

void GuiManager::onButtonEvent(ofxDatGuiButtonEvent e)
{
    cout << "onButtonEvent: " << e.target->getName() << " Selected" << endl;
    
    if(e.target->getName() == "Autodiscovery")
    {
        AppManager::getInstance().getUdpManager().sendAutodiscovery();
    }
}


void GuiManager::onToggleEvent(ofxDatGuiToggleEvent e)
{
    cout << "onToggleEvent: " << e.target->getName() << " Selected" << endl;
    
    if(e.target->getName() == "Clear")
    {
        AppManager::getInstance().getLightSculptureManager().onClearLights(e.target->getChecked());
    }
    else if(e.target->getName() == "SendHeights")
    {
        AppManager::getInstance().getLightSculptureManager().onToggleSendHeights(e.target->getChecked());
        ofLogNotice() <<"GuiManager::onToggleEvent -> SendHeights : " << e.target->getChecked();
    }
}

void GuiManager::onMatrixEvent(ofxDatGuiMatrixEvent e)
{
    cout << "onMatrixEvent " << e.child << " : " << e.enabled << endl;
}

