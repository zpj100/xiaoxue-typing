package com.xiaoxue.typing;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;

import androidx.core.content.FileProvider;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class Updater {
    public static final String RELEASES_API = "https://gitee.com/api/v5/repos/zpj100/xiaoxue-typing/releases/latest";
    public static final String RELEASES_PAGE = "https://gitee.com/zpj100/xiaoxue-typing/releases";

    private final Activity activity;

    public Updater(Activity activity) {
        this.activity = activity;
    }

    public String fetchLatest() throws Exception {
        HttpURLConnection connection = open(RELEASES_API);
        try {
            int code = connection.getResponseCode();
            InputStream stream = code >= 400 ? connection.getErrorStream() : connection.getInputStream();
            String body = readAll(stream);
            if (code == 404) {
                return "";
            }
            if (code != 200) {
                throw new IllegalStateException("检查更新失败：HTTP " + code);
            }
            return body;
        } finally {
            connection.disconnect();
        }
    }

    public void openUrl(String url) {
        String target = url == null || url.trim().isEmpty() ? RELEASES_PAGE : url.trim();
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(target));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(intent);
    }

    public void downloadAndInstall(String url, String name) {
        if (url == null || url.trim().isEmpty()) {
            openUrl(RELEASES_PAGE);
            return;
        }
        final String apkUrl = url.trim();
        final String fileName = (name == null || name.trim().isEmpty()) ? "xiaoxue-typing-update.apk" : name.trim();
        new Thread(() -> {
            try {
                File apk = download(apkUrl, fileName);
                activity.runOnUiThread(() -> install(apk));
            } catch (Exception ignored) {
                activity.runOnUiThread(() -> openUrl(apkUrl));
            }
        }, "xiaoxue-update").start();
    }

    public void install(File apk) {
        if (apk == null || !apk.exists()) {
            openUrl(RELEASES_PAGE);
            return;
        }
        Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", apk);
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(intent);
    }

    private File download(String apkUrl, String fileName) throws Exception {
        File directory = new File(activity.getExternalCacheDir() != null ? activity.getExternalCacheDir() : activity.getCacheDir(), "updates");
        if (!directory.exists() && !directory.mkdirs()) {
            throw new IllegalStateException("无法创建下载目录");
        }
        File target = new File(directory, fileName);
        File partial = new File(directory, fileName + ".download");
        if (partial.exists()) {
            partial.delete();
        }
        HttpURLConnection connection = open(apkUrl);
        try {
            int code = connection.getResponseCode();
            if (code < 200 || code >= 300) {
                throw new IllegalStateException("下载失败：HTTP " + code);
            }
            try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(partial)) {
                byte[] buffer = new byte[128 * 1024];
                int count;
                while ((count = input.read(buffer)) >= 0) {
                    output.write(buffer, 0, count);
                }
                output.getFD().sync();
            }
        } finally {
            connection.disconnect();
        }
        if (partial.length() < 10_000L) {
            throw new IllegalStateException("下载的安装包不完整");
        }
        if (target.exists()) {
            target.delete();
        }
        if (!partial.renameTo(target)) {
            throw new IllegalStateException("无法保存安装包");
        }
        return target;
    }

    private HttpURLConnection open(String target) throws Exception {
        HttpURLConnection connection = (HttpURLConnection) new URL(target).openConnection();
        connection.setConnectTimeout(10_000);
        connection.setReadTimeout(30_000);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("Accept", "application/json, application/vnd.android.package-archive, */*");
        connection.setRequestProperty("User-Agent", "XiaoXueTyping/" + BuildConfig.VERSION_NAME);
        return connection;
    }

    private String readAll(InputStream stream) throws Exception {
        if (stream == null) {
            return "";
        }
        BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8));
        StringBuilder builder = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            builder.append(line);
        }
        return builder.toString();
    }
}
