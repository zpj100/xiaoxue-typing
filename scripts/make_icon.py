#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

FONT = "/usr/share/fonts/truetype/arphic/ukai.ttc"
BG = (255, 255, 255)
BLUE = (37, 99, 235)
ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android/app/src/main/res"
PUBLIC = ROOT / "public"
LAUNCHER = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}
FOREGROUND = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}


def font(size):
    try:
        return ImageFont.truetype(FONT, size, index=0)
    except TypeError:
        return ImageFont.truetype(FONT, size)


def draw_icon(size, pad_ratio=0.12):
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    top = "学记"
    bot = "小学"
    inner = size * (1 - pad_ratio * 2)
    fs_top = max(10, int(inner * 0.38))
    fs_bot = max(9, int(inner * 0.38))
    ft = font(fs_top)
    fb = font(fs_bot)
    bt = d.textbbox((0, 0), top, font=ft)
    bb = d.textbbox((0, 0), bot, font=fb)
    tw, th = bt[2] - bt[0], bt[3] - bt[1]
    bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    gap = max(1, int(size * 0.04))
    total = th + gap + bh
    y0 = (size - total) // 2 - bt[1]
    d.text(((size - tw) // 2 - bt[0], y0), top, font=ft, fill=BLUE)
    y1 = y0 + th + gap - bb[1] + bt[1]
    d.text(((size - bw) // 2 - bb[0], y1), bot, font=fb, fill=BLUE)
    return img


def save_png(path, image):
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG")
    print("wrote", path)


def main():
    for folder, size in LAUNCHER.items():
        dest = RES / folder
        icon = draw_icon(size, pad_ratio=0.08)
        save_png(dest / "ic_launcher.png", icon)
        save_png(dest / "ic_launcher_round.png", icon)
    for folder, size in FOREGROUND.items():
        save_png(RES / folder / "ic_launcher_foreground.png", draw_icon(size, pad_ratio=0.22))
    PUBLIC.mkdir(parents=True, exist_ok=True)
    save_png(PUBLIC / "favicon.png", draw_icon(32, pad_ratio=0.06))
    save_png(PUBLIC / "app-icon.png", draw_icon(192, pad_ratio=0.08))
    save_png(PUBLIC / "app-icon-512.png", draw_icon(512, pad_ratio=0.08))


if __name__ == "__main__":
    main()
