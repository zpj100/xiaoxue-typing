package com.xiaoxue.typing;

import android.webkit.JavascriptInterface;

public class SpeakBridge {
    private final Speaker speaker;

    public SpeakBridge(Speaker speaker) {
        this.speaker = speaker;
    }

    @JavascriptInterface
    public void speak(String text, String lang) {
        speaker.speak(text, lang);
    }

    @JavascriptInterface
    public void stop() {
        speaker.stop();
    }
}
