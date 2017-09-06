/*
 *  EqualizerApp.cpp
 *  Equalizer App
 *
 *  Created by Imanol Gomez on 22/08/17.
 *
 */


#include "AppManager.h"

#include "EqualizerApp.h"

//--------------------------------------------------------------
void EqualizerApp::setup(){
    AppManager::getInstance().setup();
}

//--------------------------------------------------------------
void EqualizerApp::update(){
    AppManager::getInstance().update();
}

//--------------------------------------------------------------
void EqualizerApp::draw(){
    AppManager::getInstance().draw();
}

void EqualizerApp::exit()
{
    ofLogNotice() <<"EqualizerApp::exit";

}

//--------------------------------------------------------------
void EqualizerApp::keyPressed(int key){

}

//--------------------------------------------------------------
void EqualizerApp::keyReleased(int key){

}

//--------------------------------------------------------------
void EqualizerApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void EqualizerApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void EqualizerApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void EqualizerApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void EqualizerApp::windowResized(int w, int h){
    AppManager::getInstance().getLayoutManager().windowResized(w,h);


}

//--------------------------------------------------------------
void EqualizerApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void EqualizerApp::dragEvent(ofDragInfo dragInfo){

}
