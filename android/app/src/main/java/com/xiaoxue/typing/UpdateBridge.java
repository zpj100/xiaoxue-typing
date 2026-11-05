package com.xiaoxue.typing;

import android.app.Activity;
import android.webkit.JavascriptInterface;

public class UpdateBridge {
    private final Activity activity;
    private final Updater updater;

    public UpdateBridge(Activity activity, Updater updater) {
        this.activity = activity;
        this.updater = updater;
    }

    @JavascriptInterface
    public String currentVersion() {
        return BuildConfig.VERSION_NAME;
    }

    @JavascriptInterface
    public String checkLatest() {
        try {
            return updater.fetchLatest();
        } catch (Exception error) {
            return "ERROR:" + error.getMessage();
        }
    }

    @JavascriptInterface
    public void openUrl(String url) {
        activity.runOnUiThread(() -> updater.openUrl(url));
    }

    @JavascriptInterface
    public void downloadAndInstall(String url, String name) {
        activity.runOnUiThread(() -> updater.downloadAndInstall(url, name));
    }
}
