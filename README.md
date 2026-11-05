# 小学打字训练营

给小学生用的语文 / 英语打字游戏。打开浏览器就能练。

当前版本 **1.0.0**。公开仓：[github.com/zpj100/xiaoxue-typing](https://github.com/zpj100/xiaoxue-typing)。安装包在 [Releases](https://github.com/zpj100/xiaoxue-typing/releases)。App 内「关于」可检查更新并下载发行版 APK。

## 练什么

- 语文：拼音（声母韵母整体认读）、识字（看字打拼音）、写字（看提示打汉字）
- 英语：单词、音标、短语、语法填空（人教版小学词表抽样）

## 四种玩法

- 跟打：屏幕上有答案，照着敲。打错整词重来
- 默写：只给汉字、中文或音标
- 落字：整词往下掉，打对就接住
- 字母落：逐个字母落下，同步读字母、单词和汉字/翻译

玩法借鉴：

- [Qwerty Learner](https://github.com/RealKai42/qwerty-learner) 打错整词重来、词库 JSON
- [TypeWords](https://github.com/zyronon/TypeWords) 跟打 / 辨认 / 默写分档
- [Tux Typing](https://github.com/tux4kids/tuxtype) 落字接住
- [hanzi-writer / Make Me a Hanzi](https://github.com/skishore/makemeahanzi) 识字笔顺思路

## 启动

```bash
# 安装依赖
npm install

# 开发预览
npm run dev
```

浏览器打开提示的本地地址。进度存在浏览器 localStorage，不用注册。

## 打 Android APK

```bash
# 构建前端并拷进 WebView
npm run android:assets

# 打包签名 APK
cd android
./gradlew assembleRelease --no-daemon
```

产物：`android/app/build/outputs/apk/release/app-release.apk`。拷成 `xiaoxue-typing-1.0.0.apk` 挂到 GitHub Release，不要 `git add`。

包名 `com.xiaoxue.typing`，`minSdk 24`，横竖屏随平板转动。离线 WebView 用 `HashRouter`；朗读走系统 TTS（`AndroidSpeak`）。关于页走 `AndroidUpdate` 检最新发行版。

## Git

```bash
git clone https://github.com/zpj100/xiaoxue-typing.git
cd xiaoxue-typing
npm install
npm run dev
```

升版规则见 `docs/版本管理.md`。

## 技术

React + TypeScript + Vite + Bootstrap 5。 MIT License。
