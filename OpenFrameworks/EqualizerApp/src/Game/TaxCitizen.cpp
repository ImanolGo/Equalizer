/*
 *  TaxCitizen.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 20/09/17.
 *
 */


#include "TaxCitizen.h"



TaxCitizen::TaxCitizen(const CitizenSettings& settings): m_wealth(5000), m_settings(settings)
{
    this->setup(settings);
}

TaxCitizen::~TaxCitizen()
{
    //Intentionaly left empty
}

void TaxCitizen::setup(const CitizenSettings& settings)
{
    m_wealth = 1.0;
    
    
//    m_settings.id = settings.id;
//    m_settings.type = m_settings.type;
//    m_settings.directTaxRate = settings.directTaxRate;
//    m_settings.incomeTaxRate = settings.incomeTaxRate;
//    m_settings.income = settings.income;
//    m_settings.minLifeCost = settings.minLifeCost;
//    m_settings.spendingFactorIncome = settings.spendingFactorIncome;
//    m_settings.spendingFactorWealth = settings.spendingFactorWealth;
}


void TaxCitizen::update()
{
    
    float incomeTax = m_settings.income*m_settings.incomeTaxRate;
    float spending = m_settings.minLifeCost + m_settings.spendingFactorIncome*m_settings.income + m_wealth*m_settings.spendingFactorWealth;
    float directTax = spending*m_settings.directTaxRate;
    float saving = m_settings.income - incomeTax - spending - directTax;
    if(saving < 0){
        saving = 1;
    }
    
   
    
    m_wealth += (log(saving)/log(10));
                
//    
//        if(m_wealth<0){
//            m_wealth = 1.0;
//        }
//
//    
//    m_wealth = log(m_wealth) / log(10);
    
    //ofLogNotice() << " TaxCitizen::update -> id = , " << m_settings.id << ", wealth = " << m_wealth << ", spending =  " << spending<< ", income =  " << m_settings.income << ", saving =  " << saving;
    
    
    
//    if(m_settings.incomeTaxRate == 0){
//        m_settings.incomeTaxRate = 0.01;
//    }
//    float incomeTax = log(m_settings.income*m_settings.incomeTaxRate)/log(10);
//    float spending = log(m_settings.minLifeCost + m_settings.spendingFactorIncome*m_settings.income + m_wealth*m_settings.spendingFactorWealth)/log(10);
//    float directTax = log(spending*m_settings.directTaxRate)/log(10);
//    
//    float saving =log(m_settings.income)/log(10) - incomeTax - spending - directTax;
//    
//    m_wealth += saving;
//    
//    ofLogNotice() << " TaxCitizen::update -> id = , " << m_settings.id << ", wealth = " << m_wealth << ", spending =  " << spending<< ", income =  " << m_settings.income << ", saving =  " << saving;
 
    
//    
//    if(m_wealth<0){
//        m_wealth = 0.1;
//    }
//
//     m_wealth = log(m_wealth) / log(10);
//    m_wealth = log10(m_wealth);
    
}

void TaxCitizen::setTotalWealth(double value)
{
    m_percWealth = m_wealth/value;
}
