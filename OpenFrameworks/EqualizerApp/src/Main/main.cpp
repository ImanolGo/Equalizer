
#include "EqualizerApp.h"

#include "../resource.h"

#ifndef TARGET_WIN32
//========================================================================
int main() {

	ofSetupOpenGL(1024, 768, OF_FULLSCREEN);
	ofRunApp(std::make_shared<EqualizerApp>());

}

#else


int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nShowCmd) {

	ofSetupOpenGL(1280, 768, OF_WINDOW);

	HWND hwnd = ofGetWin32Window();
	HICON hMyIcon = LoadIcon(hInstance, MAKEINTRESOURCE(IDI_ICON1));
	SendMessage(hwnd, WM_SETICON, ICON_BIG, (LPARAM)hMyIcon);


	ofRunApp(new EqualizerApp());

}

#endif






