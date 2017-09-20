/*
 *  TaxManager.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 19/09/17.
 *
 */

#include "TaxManager.h"
#include "AppManager.h"


TaxManager::TaxManager(): Manager()
{
    //Intentionally left empty
}

TaxManager::~TaxManager()
{
   ofLogNotice() << "TaxManager::destructor";
}


//--------------------------------------------------------------

void TaxManager::setup()
{
    if(m_initialized)
        return;
    
    Manager::setup();
    
    
    this->readSettings();
    this->setupCitizens();
    ofLogNotice() <<"TaxManager::initialized" ;
}


void TaxManager::readSettings()
{
    ofXml xml;
    
    string path = "xmls/TaxesSettings.xml";
    if(!xml.load(path)){
        ofLogNotice() <<"TaxManager::readSettings-> unable to load file: " << path ;
        return;
    }
    
    ofLogNotice() <<"TaxManager::readSettings->  successfully loaded " << path ;
    
    
    CitizenSettings settings;
    
    xml.setTo("//");
    
    string xmlPath = "//tax_rates/direct_tax";
    if(xml.exists(xmlPath)) {
        xml.setTo(xmlPath);
        auto attributes = xml.getAttributes();
        settings.directTaxRate = ofToFloat(attributes["value"]);
        
    }

    
    xml.setTo("//");
    xmlPath = "//tax_rates/initial_values";
    if(xml.exists(xmlPath)) {
        xml.setTo(xmlPath);
        auto attributes = xml.getAttributes();
        settings.minLifeCost = ofToFloat(attributes["min_life_cost"]);
        settings.spendingFactorIncome = ofToFloat(attributes["spending_factor_income"]);
        settings.spendingFactorWealth = ofToFloat(attributes["spending_factor_wealth"]);
        
    }
    
     ofLogNotice() <<"TaxManager::readSettings->  directTaxRate =  " << settings.directTaxRate  << ", minLifeCost = " << settings.minLifeCost
    << ", spendingFactorIncome = " << settings.spendingFactorIncome << ", spendingFactorWealth = " << settings.spendingFactorWealth;
    
}

void TaxManager::setupCitizens()
{
}

void TaxManager::update()
{
}







