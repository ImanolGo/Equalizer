/*
 *  TaxManager.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 19/09/17.
 *
 */

#include "TaxManager.h"
#include "AppManager.h"


const double TaxManager::REFRESH_TIME = 0.5;
const int TaxManager::MAX_NUM_YEARS = 100;


TaxManager::TaxManager(): Manager(), m_elapsedTime(0.0), m_numYears(0)
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
    
    if(this->loadSettingsFile()){
        this->loadAllSettings();
        this->setupCitizens();
    }

    
    ofLogNotice() <<"TaxManager::initialized" ;
}



bool TaxManager::loadSettingsFile()
{
    
    string path = "xmls/TaxesSettings.xml";
    if(!m_xml.load(path)){
        ofLogNotice() <<"TaxManager::readSettings-> unable to load file: " << path ;
        return false;
    }
    
    ofLogNotice() <<"TaxManager::readSettings->  successfully loaded " << path ;
    
    return true;

}



void TaxManager::loadAllSettings()
{
    this->readTaxBands();
    this->readTaxConditions();
}

void TaxManager::readTaxBands()
{
    m_xml.setTo("//");
    string xmlPath = "//tax_rates/band[0]";
    if(m_xml.exists(xmlPath)) {
        m_xml.setTo(xmlPath);
        
        do {
            
            auto attributes = m_xml.getAttributes();
            
            TaxBand taxBand;
            
            taxBand.name =  attributes["name"];
            taxBand.min = ofToFloat(attributes["min"]);
            taxBand.max = ofToFloat(attributes["max"]);
            taxBand.rate = ofToFloat(attributes["rate"]);
            
            m_taxBands.push_back(taxBand);
            
            ofLogNotice() <<"TaxManager::readTaxBands-> name = " << taxBand.name <<", min = " <<  taxBand.min
            <<", max = "<<  taxBand.max << ", rate = " <<  taxBand.rate ;
        }
        while(m_xml.setToSibling()); // go to the next node
        
    }
}


void TaxManager::readTaxConditions()
{
    m_xml.setTo("//");
    
    string xmlPath = "//tax_rates/direct_tax";
    if(m_xml.exists(xmlPath)) {
        m_xml.setTo(xmlPath);
        auto attributes = m_xml.getAttributes();
        m_settings.directTaxRate = ofToFloat(attributes["value"]);
        
    }
    
    
    m_xml.setTo("//");
    xmlPath = "//tax_rates/initial_values";
    if(m_xml.exists(xmlPath)) {
        m_xml.setTo(xmlPath);
        auto attributes = m_xml.getAttributes();
        m_settings.minLifeCost = ofToFloat(attributes["min_life_cost"]);
        m_settings.spendingFactorIncome = ofToFloat(attributes["spending_factor_income"]);
        m_settings.spendingFactorWealth = ofToFloat(attributes["spending_factor_wealth"]);
        
    }
    
    ofLogNotice() <<"TaxManager::readTaxConditions->  directTaxRate =  " << m_settings.directTaxRate  << ", minLifeCost = " << m_settings.minLifeCost
    << ", spendingFactorIncome = " << m_settings.spendingFactorIncome << ", spendingFactorWealth = " << m_settings.spendingFactorWealth;
    

}

void TaxManager::setupCitizens()
{
    m_xml.setTo("//");
    string xmlPath = "//citizens/citizen[0]";
    if(m_xml.exists(xmlPath)) {
        m_xml.setTo(xmlPath);
        
        do {
            
            auto attributes = m_xml.getAttributes();
            m_settings.type = ofToInt(attributes["type"]);
            m_settings.id = ofToInt(attributes["id"]);
            m_settings.income = this->getTaxRandomIncome(m_settings.type);
            m_settings.incomeTaxRate = this->getTaxRate(m_settings.income);
            
            auto citizen = shared_ptr<TaxCitizen> (new TaxCitizen(m_settings));
            m_citizens[m_settings.id] = citizen;
            
            
            
            ofLogNotice() <<"TaxManager::setupCitizens-> id = " <<  m_settings.id <<", type = " <<   m_settings.type
            <<", income = " <<   m_settings.income <<", income tax rate = " <<   m_settings.incomeTaxRate;
        }
        while(m_xml.setToSibling()); // go to the next node
        
    }

}

void TaxManager::update()
{
    m_elapsedTime+= ofGetLastFrameTime();
    if(m_elapsedTime >= REFRESH_TIME && m_numYears < MAX_NUM_YEARS){
        this->updateCitizens();
        this->updateHeights();
        m_elapsedTime = 0;
        m_numYears ++;
    }
    
}

void TaxManager::updateCitizens()
{
    double maxWealth = 0;
    for(auto citizen: m_citizens){
        citizen.second->update();
        //accWealth+= citizen.second->getWealth();
        if(maxWealth<citizen.second->getWealth()){
            maxWealth = citizen.second->getWealth();
        }
       //  ofLogNotice() <<"TaxManager::updateCitizens-> id, " << citizen.second->getId() <<", wealth= " << citizen.second->getWealth();
        
    }
    
    for(auto citizen: m_citizens){
        citizen.second->setTotalWealth(maxWealth);
    }
    
   // ofLogNotice() <<"TaxManager::updateCitizens-> acc wealth= " << maxWealth;
}

void TaxManager::updateHeights()
{
    for(auto citizen: m_citizens){
        AppManager::getInstance().getLightSculptureManager().setHeight(citizen.second->getId(), citizen.second->getPercentageWealth());
        //citizen.second->setTotalWealth(accWealth);
    }
}

float TaxManager::getTaxRate(float income)
{
    for(int i = m_taxBands.size()-1; i >= 0; i--)
    {
        auto & taxBand = m_taxBands[i];
        if( income >= taxBand.min && income < taxBand.max ){
            //ofLogNotice() <<"TaxManager::getTaxRate -> " << taxBand.rate;
            return taxBand.rate;
        }
    }
    
    return 0.0;
}


float TaxManager::getTaxRandomIncome(int type)
{
    if(type < 0 || type >=m_taxBands.size()){
        return 0.0;
    }
    
    auto& taxBand = m_taxBands[type];

    //return ofRandom(((taxBand.min >  m_settings.minLifeCost) ? taxBand.min :  m_settings.minLifeCost), taxBand.max);
    return ofRandom( taxBand.min, taxBand.max);
}


void TaxManager::onSetBasicIncome(float& value)
{
    m_numYears = 0;
    m_elapsedTime = REFRESH_TIME;
    
    for(auto citizen: m_citizens){
        citizen.second->reset();
        citizen.second->setUniversalIncome(value*0.8);
    }
}



void TaxManager::onSetDirectTaxRate(float& value)
{
    m_numYears = 0;
    m_elapsedTime = REFRESH_TIME;
    
    for(auto citizen: m_citizens){
        citizen.second->reset();
        citizen.second->setDirectTax(value);
    }
}

void TaxManager::setIncomeTaxRate(float value, int type)
{
    if(type<0 || type>=m_taxBands.size())return;
    
    m_numYears = 0;
    m_elapsedTime = REFRESH_TIME;

    m_taxBands[type].rate = value;
    
    for(auto citizen: m_citizens){
        citizen.second->reset();
        auto incomeTaxRate = this->getTaxRate(citizen.second->getIncome());
        citizen.second->setIncomeTaxRate(incomeTaxRate);
    }
}





