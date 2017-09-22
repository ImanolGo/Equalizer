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
    float directTaxRate = 10.0;
    float incomeTaxRate = 10.0;
    float income = 10000;
    float minLifeCost = 8000;
    float spendingFactorIncome = 0.05;
    float spendingFactorWealth = 0.2;
    
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
    
    void update();
    
    void setTotalWealth(double value);
    
    void resetWealth() {m_wealth = 1.0;}
    
private:
    
    void setup(const CitizenSettings& settings);
    
private:
    
    CitizenSettings m_settings;
    double m_wealth;
    float m_percWealth;
    

};




