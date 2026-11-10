# 小学打字训练营

给小学生用的语文 / 英语打字游戏。打开浏览器就能练。

当前版本 **1.4.0**。公开仓：[gitee.com/zpj100/xiaoxue-typing](https://gitee.com/zpj100/xiaoxue-typing)。安装包在 [Gitee Releases](https://gitee.com/zpj100/xiaoxue-typing/releases)。App 内「关于」检查 Gitee 发行版并安装 APK。GitHub 镜像：[github.com/zpj100/xiaoxue-typing](https://github.com/zpj100/xiaoxue-typing)。

## 练什么

- 语文：拼音（声母 / 韵母 / 整体认读 / 拼读）、识字、写字，按 1–6 年级上下册分课
- 英语：48 个国际音标表 + 人教版 PEP 课本草，单词、音标、短语、语法填空，按 3–6 年级上下册单元分课

## 七种玩法

- 跟打：屏幕上有答案，照着敲。打错整词重来。平板虚拟键盘可直接输入
- 默写：只给汉字、中文或音标
- 听写：只播声音，打出拼音或例词
- 跟读：先听再跟读，读完点会了或还不会
- 闪卡：先默打，对了自动过；翻面后评级
- 落字：整词往下掉，打对就接住，速度可调
- 字母落：逐个字母落下，同步读字母、单词和汉字/翻译

玩法借鉴（按 star / fork 取最高）：

- [Qwerty Learner](https://github.com/RealKai42/qwerty-learner) 23.7k star / 2.7k fork：打错整词重来、键位高亮、WPM
- [TypeWords](https://github.com/zyronon/TypeWords) 11.4k star / 1.4k fork：跟打 / 默写、错词本
- [Tux Typing](https://github.com/tux4kids/tuxtype) 落字接住
- [hanzi-writer](https://github.com/chanind/hanzi-writer) 识字笔顺思路

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

产物：`android/app/build/outputs/apk/release/app-release.apk`。拷成 `xiaoxue-typing-1.4.0.apk` 挂到 Gitee Release，不要 `git add`。

包名 `com.xiaoxue.typing`，`minSdk 24`，横竖屏随平板转动。离线 WebView 用 `HashRouter`；朗读走系统 TTS（`AndroidSpeak`）。关于页走 `AndroidUpdate` 检 Gitee 最新发行版。

## Git

```bash
git clone https://gitee.com/zpj100/xiaoxue-typing.git
cd xiaoxue-typing
npm install
npm run dev
```

升版规则见 `docs/版本管理.md`。

## 技术

React + TypeScript + Vite + Bootstrap 5。 MIT License。
