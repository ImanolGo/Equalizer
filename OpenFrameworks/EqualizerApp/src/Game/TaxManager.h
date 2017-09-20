/*
 *  TaxManager.h
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 19/09/17.
 *
 */



#pragma once

#include "ofMain.h"
#include "Manager.h"
#include "TaxCitizen.h"

//========================== class TaxManager =======================================
//==============================================================================
/** \class TaxManager TaxManager.h
 *	\brief class for managing the taxes
 *	\details It sets the taxes game and calculates the result
 */


class TaxManager: public Manager
{

public:
    //! Constructor
    TaxManager();

    //! Destructor
    virtual ~TaxManager();

    //! setups the tax manager
    void setup();
    
    //! updates the tax manager
    void update();
    

private:
    
    void readSettings();
    
    void setupCitizens();
    
    
private:
    
    typedef map<int, shared_ptr<TaxCitizen> > CitizenMap;
    
    CitizenMap m_citizens;

};

