/*
 *  TaxCitizen.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 20/09/17.
 *
 */


#include "TaxCitizen.h"



TaxCitizen::TaxCitizen(const CitizenSettings& settings): m_settings(settings), m_wealth(5000)
{
    this->setup();
}

TaxCitizen::~TaxCitizen()
{
    //Intentionaly left empty
}

void TaxCitizen::setup()
{
    m_wealth = 5000;
}


void TaxCitizen::update()
{
    
    float incomeTax = m_settings.income*m_settings.incomeTaxRate;
   
    float spending = m_settings.minLifeCost + m_settings.spendingFactorIncome*m_settings.income + m_wealth*m_settings.spendingFactorWealth;
    
    float directTax = spending*m_settings.directTaxRate;
    
    float saving = m_settings.income - incomeTax - spending - directTax;
    
    m_wealth += saving;
    
}
