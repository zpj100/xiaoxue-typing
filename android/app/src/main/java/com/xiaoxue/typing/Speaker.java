package com.xiaoxue.typing;

import android.content.Context;
import android.media.AudioAttributes;
import android.os.Build;
import android.speech.tts.TextToSpeech;

import java.util.Locale;

public class Speaker {
    private TextToSpeech tts;
    private volatile boolean ready = false;

    public Speaker(Context context) {
        tts = new TextToSpeech(context.getApplicationContext(), new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                ready = status == TextToSpeech.SUCCESS && tts != null;
                if (!ready) {
                    return;
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    tts.setAudioAttributes(
                            new AudioAttributes.Builder()
                                    .setUsage(AudioAttributes.USAGE_MEDIA)
                                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                                    .build()
                    );
                }
                tts.setSpeechRate(0.88f);
                tts.setLanguage(Locale.CHINA);
            }
        });
    }

    public void speak(String text, String lang) {
        if (!ready || tts == null || text == null) {
            return;
        }
        String toSpeak = text.trim();
        if (toSpeak.length() == 0) {
            return;
        }
        Locale locale = Locale.CHINA;
        if (lang != null && lang.toLowerCase(Locale.ROOT).startsWith("en")) {
            locale = Locale.US;
        }
        try {
            tts.setLanguage(locale);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                tts.speak(toSpeak, TextToSpeech.QUEUE_ADD, null, "xiaoxue");
            }
        } catch (Exception ignored) {
        }
    }

    public void stop() {
        if (tts != null) {
            try {
                tts.stop();
            } catch (Exception ignored) {
            }
        }
    }

    public void shutdown() {
        ready = false;
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
            } catch (Exception ignored) {
            }
            tts = null;
        }
    }
}
