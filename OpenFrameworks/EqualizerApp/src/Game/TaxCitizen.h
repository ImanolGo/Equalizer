/*
 *  TaxCitizen.h
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 20/09/17.
 *
 */


#pragma once

#include "ofMain.h"

struct CitizenSettings {
    int id = 0;
    int type = 0;
    float directTaxRate = 10.;
    float incomeTaxRate = 10.0;
    float income = 10000;
    float minLifeCost = 8000;
    float spendingFactorIncome = 0.05;
    float spendingFactorWealth = 0.2;
    float universalIncome = 0.0;
    
};



class TaxCitizen
{
    
public:
    
    TaxCitizen(const CitizenSettings& settings);
    
    virtual ~TaxCitizen();
    
    int getId() const {return m_settings.id;}
    
    int getType() const {return m_settings.type;}
    
    float getWealth() const {return m_wealth;}
    
    float getPercentageWealth() const {return m_percWealth;}
    
    float getIncome() const {return m_settings.income;}
    
    void setIncomeTaxRate(float value){m_settings.incomeTaxRate = value;}
    
    void update();
    
    void reset();
    
    void setTotalWealth(double value);
    
    void resetWealth() {m_wealth = 1.0;}
    
    void setUniversalIncome(float value){m_settings.universalIncome = value;}
    
    void setDirectTax(float value);
    
private:
    
    void setup();
    
private:
    
    CitizenSettings m_settings;
    double m_wealth;
    float m_percWealth;
    

};




