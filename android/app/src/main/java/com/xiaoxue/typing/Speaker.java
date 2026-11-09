package com.xiaoxue.typing;

import android.content.Context;
import android.media.AudioAttributes;
import android.os.Build;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import java.util.Locale;

public class Speaker {
    public interface DoneCallback {
        void onDone();
    }

    private TextToSpeech tts;
    private volatile boolean ready = false;
    private volatile String pendingId = "";
    private volatile DoneCallback pendingDone;

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
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String utteranceId) {
                    }

                    @Override
                    public void onDone(String utteranceId) {
                        finish(utteranceId);
                    }

                    @Override
                    public void onError(String utteranceId) {
                        finish(utteranceId);
                    }
                });
            }
        });
    }

    public void speak(String text, String lang, DoneCallback onDone) {
        if (!ready || tts == null || text == null) {
            if (onDone != null) {
                onDone.onDone();
            }
            return;
        }
        String toSpeak = text.trim();
        if (toSpeak.length() == 0) {
            if (onDone != null) {
                onDone.onDone();
            }
            return;
        }
        Locale locale = Locale.CHINA;
        if (lang != null && lang.toLowerCase(Locale.ROOT).startsWith("en")) {
            locale = Locale.US;
        }
        String utteranceId = "xiaoxue-" + System.nanoTime();
        DoneCallback previous = pendingDone;
        pendingId = utteranceId;
        pendingDone = onDone;
        try {
            tts.setLanguage(locale);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                tts.speak(toSpeak, TextToSpeech.QUEUE_FLUSH, null, utteranceId);
            } else if (onDone != null) {
                onDone.onDone();
            }
        } catch (Exception ignored) {
            if (onDone != null) {
                onDone.onDone();
            }
        }
        if (previous != null) {
            previous.onDone();
        }
    }

    private void finish(String utteranceId) {
        if (utteranceId == null || !utteranceId.equals(pendingId)) {
            return;
        }
        DoneCallback callback = pendingDone;
        pendingDone = null;
        pendingId = "";
        if (callback != null) {
            callback.onDone();
        }
    }

    public void stop() {
        DoneCallback callback = pendingDone;
        pendingDone = null;
        pendingId = "";
        if (tts != null) {
            try {
                tts.stop();
            } catch (Exception ignored) {
            }
        }
        if (callback != null) {
            callback.onDone();
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
