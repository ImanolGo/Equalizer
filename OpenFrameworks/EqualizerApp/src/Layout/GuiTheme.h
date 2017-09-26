/*
 *  GuiTheme.h
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 22/09/17.
 *
 */


#pragma once

#include "ofxDatGuiTheme.h"

//========================== class GuiTheme ==============================
//============================================================================
/** \class GuiTheme GuiTheme.h
 *	\brief Costume GUI theme
 *	\details Based on ofxDatGuiTheme
 */


class GuiTheme : public ofxDatGuiTheme{
    
public:
    
    GuiTheme()
    {
        layout.width = 500;
        layout.height = 50;
        layout.labelWidth = 140;
        layout.upperCaseLabels = false;
        //font.file =  AssetPath + "fonts/open-sans/OpenSans-Semibold.ttf";
        font.size = 11;

        color.matrix.normal.button = hex(0x6E6E6E);
        color.matrix.hover.button = hex(0x9C9DA1);
        color.matrix.selected.button = hex(0x2FA1D6);
        
        init();
    }
};
