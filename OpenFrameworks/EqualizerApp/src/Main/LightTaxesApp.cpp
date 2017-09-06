/*
 *  LightTaxesApp.cpp
 *  Light Taxes App
 *
 *  Created by Imanol Gomez on 22/08/17.
 *
 */

#include "AppManager.h"

#include "LightTaxesApp.h"

//--------------------------------------------------------------
void LightTaxesApp::setup(){
    AppManager::getInstance().setup();
}

//--------------------------------------------------------------
void LightTaxesApp::update(){
    AppManager::getInstance().update();
}

//--------------------------------------------------------------
void LightTaxesApp::draw(){
    AppManager::getInstance().draw();
}

void LightTaxesApp::exit()
{
    ofLogNotice() <<"LightTaxesApp::exit";

}

//--------------------------------------------------------------
void LightTaxesApp::keyPressed(int key){

}

//--------------------------------------------------------------
void LightTaxesApp::keyReleased(int key){

}

//--------------------------------------------------------------
void LightTaxesApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void LightTaxesApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void LightTaxesApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void LightTaxesApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void LightTaxesApp::windowResized(int w, int h){
    AppManager::getInstance().getLayoutManager().windowResized(w,h);


}

//--------------------------------------------------------------
void LightTaxesApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void LightTaxesApp::dragEvent(ofDragInfo dragInfo){

}
