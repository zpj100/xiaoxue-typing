package com.xiaoxue.typing;

import android.os.Handler;
import android.os.Looper;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

public class SpeakBridge {
    private final Speaker speaker;
    private final WebView webView;
    private final Handler main = new Handler(Looper.getMainLooper());

    public SpeakBridge(Speaker speaker, WebView webView) {
        this.speaker = speaker;
        this.webView = webView;
    }

    @JavascriptInterface
    public void speak(String text, String lang) {
        speaker.speak(text, lang, null);
    }

    @JavascriptInterface
    public void speakAndNotify(String text, String lang) {
        speaker.speak(text, lang, () -> main.post(() -> {
            if (webView != null) {
                webView.evaluateJavascript("window.__xiaoxueSpeakDone && window.__xiaoxueSpeakDone()", null);
            }
        }));
    }

    @JavascriptInterface
    public void stop() {
        speaker.stop();
    }
}
