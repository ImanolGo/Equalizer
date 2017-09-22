
#include "EqualizerApp.h"

#ifndef TARGET_WIN32
//========================================================================
int main() {

	ofSetupOpenGL(1024, 768, OF_WINDOW);
	ofRunApp(std::make_shared<EqualizerApp>());

}

#else


int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nShowCmd) {

	ofSetupOpenGL(1280, 768, OF_WINDOW);
	ofRunApp(new EqualizerApp());

}

#endif



