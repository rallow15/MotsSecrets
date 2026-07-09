#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mots Secrets - Promotional Video Generator
Creates a 9:16 vertical video (1080x1920) for social media using app assets.
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from moviepy.editor import (
    VideoClip, ImageClip, TextClip, CompositeVideoClip, ColorClip,
    concatenate_videoclips, vfx
)
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import numpy as np
import os

# ── Constants ──────────────────────────────────────────────────────
W, H = 1080, 1920
FPS = 30
DARK_BG = (8, 8, 10)
PURPLE = (180, 77, 255)
PURPLE_DARK = (26, 10, 46)
NEON_GREEN = (232, 255, 71)
LIGHT_LAVENDER = (232, 213, 255)
ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")

# ── Helper: create gradient background ─────────────────────────────
def make_gradient_bg(w=W, h=H, color_top=(15, 5, 30), color_bot=(8, 8, 10)):
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        r = int(color_top[0] + (color_bot[0] - color_top[0]) * y / h)
        g = int(color_top[1] + (color_bot[1] - color_top[1]) * y / h)
        b = int(color_top[2] + (color_bot[2] - color_top[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return np.array(img)

# ── Helper: add glow circle ────────────────────────────────────────
def make_glow_circle(radius=300, color=PURPLE, alpha=80):
    size = radius * 2
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for r in range(radius, 0, -1):
        a = int(alpha * (1 - (r / radius) ** 2))
        draw.ellipse([radius - r, radius - r, radius + r, radius + r],
                      fill=(*color, a))
    return img

# ── Helper: PIL to numpy ───────────────────────────────────────────
def pil_to_np(img):
    return np.array(img.convert("RGB"))

# ── Helper: load image as PIL ──────────────────────────────────────
def load_asset(name, size=None, keep_aspect=True):
    path = os.path.join(ASSETS, name)
    img = Image.open(path).convert("RGBA")
    if size:
        if keep_aspect:
            img.thumbnail(size, Image.LANCZOS)
        else:
            img = img.resize(size, Image.LANCZOS)
    return img

# ── Helper: composite PIL images ────────────────────────────────────
def composite_center(base, overlay, y_offset=0, x_offset=0):
    x = (base.width - overlay.width) // 2 + x_offset
    y = (base.height - overlay.height) // 2 + y_offset
    base.paste(overlay, (x, y), overlay if overlay.mode == "RGBA" else None)
    return base

# ── Helper: get font ───────────────────────────────────────────────
def get_font(size):
    """Try to get a decent font, fallback to default."""
    font_paths = [
        "arial.ttf",
        "Arial.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/impact.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for fp in font_paths:
        try:
            return ImageFont.truetype(fp, size)
        except (OSError, IOError):
            continue
    return ImageFont.load_default()


# ── Build frames for each section ──────────────────────────────────

def build_intro_frame(t_ratio):
    """Section 1: Logo reveal with glow (0-3s)"""
    bg = Image.new("RGBA", (W, H), (*DARK_BG, 255))

    # Animated glow (pulsing)
    glow_alpha = int(60 + 40 * np.sin(t_ratio * np.pi * 2))
    glow = make_glow_circle(radius=350, color=PURPLE, alpha=glow_alpha)
    bg.paste(glow, ((W - glow.width) // 2, (H - glow.height) // 2 - 100), glow)

    # Logo scaling in
    logo = load_asset("logo-title.png", size=(500, 500))
    scale = min(1.0, 0.5 + t_ratio * 0.8)
    new_size = (int(logo.width * scale), int(logo.height * scale))
    logo_scaled = logo.resize(new_size, Image.LANCZOS)
    composite_center(bg, logo_scaled, y_offset=-150)

    # Title text
    font_title = get_font(72)
    draw = ImageDraw.Draw(bg)
    title = "MOTS SECRETS"
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    alpha_text = int(255 * min(1.0, t_ratio * 2))
    draw.text(((W - tw) // 2, H // 2 + 180), title,
              fill=(*PURPLE, alpha_text), font=font_title)

    return np.array(bg.convert("RGB"))


def build_tagline_frame(t_ratio):
    """Section 2: Tagline (3-5s)"""
    bg = Image.new("RGBA", (W, H), (*DARK_BG, 255))

    # Glow
    glow = make_glow_circle(radius=400, color=PURPLE, alpha=50)
    bg.paste(glow, ((W - glow.width) // 2, (H - glow.height) // 2 - 200), glow)

    # Spy icon
    spy = load_asset("spy-icon.png", size=(300, 300))
    composite_center(bg, spy, y_offset=-250)

    font_big = get_font(64)
    font_sub = get_font(42)

    draw = ImageDraw.Draw(bg)

    lines = [
        ("TROUVEZ L'IMPOSTEUR", font_big, PURPLE, -50),
        ("parmi vous...", font_sub, LIGHT_LAVENDER, 30),
    ]

    for text, font, color, y_off in lines:
        bbox = draw.textbbox((0, 0), text, font=font)
        tw = bbox[2] - bbox[0]
        alpha = int(255 * min(1.0, t_ratio * 2.5))
        draw.text(((W - tw) // 2, H // 2 + y_off), text,
                  fill=(*color, alpha), font=font)

    return np.array(bg.convert("RGB"))


def build_modes_frame(t_ratio):
    """Section 3: Game modes showcase (5-9s)"""
    bg = Image.new("RGBA", (W, H), (*DARK_BG, 255))

    # Glow background
    glow = make_glow_circle(radius=500, color=PURPLE, alpha=35)
    bg.paste(glow, ((W - glow.width) // 2, (H - glow.height) // 2), glow)

    font_title = get_font(56)
    font_label = get_font(36)

    draw = ImageDraw.Draw(bg)

    # Section title
    title = "5 MODES DE JEU"
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 140), title, fill=(*PURPLE, 255), font=font_title)

    modes = [
        ("mode-normal.png", "UNDERCOVER", 0),
        ("mode-mister-white.png", "MISTER WHITE", 1),
        ("mode-mister-intrus.png", "MISTER WHITE\n+ IMPOSTOR", 2),
        ("mode-spyfall.png", "SPYFALL", 3),
        ("mode-mime.png", "MIME", 4),
    ]

    start_y = 280
    card_height = 280
    spacing = 20

    for icon_name, label, idx in modes:
        progress = min(1.0, max(0, (t_ratio * 5 - idx * 0.6) * 2))
        if progress <= 0:
            continue

        y = start_y + idx * (card_height + spacing)
        x_offset = int((1 - progress) * 400)  # slide from right

        # Card background
        card = Image.new("RGBA", (W - 100, card_height), (*PURPLE_DARK, int(200 * progress)))
        draw_card = ImageDraw.Draw(card)
        draw_card.rectangle([0, 0, card.width - 1, card_height - 1],
                           outline=(*PURPLE, int(150 * progress)), width=2)

        bg.paste(card, (50 + x_offset, y), card)

        # Icon
        icon = load_asset(icon_name, size=(180, 180))
        # Apply progress alpha
        icon_arr = np.array(icon)
        icon_arr[:, :, 3] = (icon_arr[:, :, 3] * progress).astype(np.uint8)
        icon = Image.fromarray(icon_arr)

        bg.paste(icon, (100 + x_offset, y + (card_height - icon.height) // 2), icon)

        # Label
        draw = ImageDraw.Draw(bg)
        text_alpha = int(255 * progress)
        for i, line in enumerate(label.split('\n')):
            lbbox = draw.textbbox((0, 0), line, font=font_label)
            lw = lbbox[2] - lbbox[0]
            draw.text((380 + x_offset, y + card_height // 2 - 30 + i * 40),
                     line, fill=(*LIGHT_LAVENDER, text_alpha), font=font_label)

    return np.array(bg.convert("RGB"))


def build_screenshots_frame(t_ratio):
    """Section 4: Screenshots showcase (9-13s)"""
    bg = Image.new("RGBA", (W, H), (*DARK_BG, 255))

    # Glow
    glow = make_glow_circle(radius=500, color=PURPLE, alpha=40)
    bg.paste(glow, ((W - glow.width) // 2, (H - glow.height) // 2), glow)

    font = get_font(48)
    font_sub = get_font(36)

    draw = ImageDraw.Draw(bg)

    # Title
    title = "VIVEZ L'EXPERIENCE"
    bbox = draw.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 100), title, fill=(*NEON_GREEN, 255), font=font)

    # Show 3 screenshots side by side
    screens = []
    for i in range(1, 4):
        path = os.path.join(ASSETS, f"screenshots/google-play/screenshot{i}.png")
        if os.path.exists(path):
            img = Image.open(path).convert("RGBA")
            img = img.resize((240, 426), Image.LANCZOS)
            screens.append(img)

    if screens:
        # Center screenshot (larger)
        center = screens[min(1, len(screens) - 1)].resize((320, 568), Image.LANCZOS)
        composite_center(bg, center, y_offset=50)

        # Left screenshot (slide in from left)
        if len(screens) > 0:
            left = screens[0].resize((240, 426), Image.LANCZOS)
            x_slide = int((1 - min(1, t_ratio * 2)) * (-300))
            bg.paste(left, (60 + x_slide, H // 2 - 213 + 50), left)

        # Right screenshot (slide in from right)
        if len(screens) > 2:
            right = screens[2].resize((240, 426), Image.LANCZOS)
            x_slide = int((1 - min(1, t_ratio * 2)) * 300)
            bg.paste(right, (W - 300 + x_slide, H // 2 - 213 + 50), right)

    # Bottom text
    sub = "3 à 20 joueurs • Pass-the-phone"
    bbox2 = draw.textbbox((0, 0), sub, font=font_sub)
    tw2 = bbox2[2] - bbox2[0]
    draw.text(((W - tw2) // 2, H - 300), sub, fill=(*LIGHT_LAVENDER, 200), font=font_sub)

    return np.array(bg.convert("RGB"))


def build_categories_frame(t_ratio):
    """Section 5: Categories showcase (13-16s)"""
    bg = Image.new("RGBA", (W, H), (*DARK_BG, 255))

    glow = make_glow_circle(radius=400, color=PURPLE, alpha=45)
    bg.paste(glow, ((W - glow.width) // 2, (H - glow.height) // 2 - 100), glow)

    font_title = get_font(52)
    font_cat = get_font(38)

    draw = ImageDraw.Draw(bg)

    title = "15+ CATÉGORIES"
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 160), title, fill=(*NEON_GREEN, 255), font=font_title)

    categories = [
        "⚽ Football", "\U0001f3c0 Basketball", "\U0001f3ac Cinéma", "\U0001f3ae Jeux Vidéo",
        "\U0001f3b5 Musique", "\U0001f697 Voitures", "\U0001f1f8 Pays", "\U0001f43e Animaux",
        "\U0001f4bc Professions", "\U0001f4f1 Marques", "\U0001f3ad Manga", "\U0001f3df Sport",
    ]

    cols = 3
    col_w = W // cols

    for i, cat in enumerate(categories):
        progress = min(1.0, max(0, (t_ratio * 4 - i * 0.15) * 1.5))
        if progress <= 0:
            continue

        col = i % cols
        row = i // cols
        x = col * col_w + 60
        y = 300 + row * 110

        alpha = int(255 * progress)
        draw.text((x, y), cat, fill=(*LIGHT_LAVENDER, alpha), font=font_cat)

    return np.array(bg.convert("RGB"))


def build_cta_frame(t_ratio):
    """Section 6: Call to action (16-20s)"""
    bg = Image.new("RGBA", (W, H), (*DARK_BG, 255))

    # Big glow
    glow = make_glow_circle(radius=600, color=PURPLE, alpha=60)
    bg.paste(glow, ((W - glow.width) // 2, (H - glow.height) // 2 - 50), glow)

    # App icon
    icon = load_asset("icon.png", size=(250, 250))
    composite_center(bg, icon, y_offset=-300)

    font_big = get_font(80)
    font_med = get_font(48)
    font_small = get_font(36)

    draw = ImageDraw.Draw(bg)

    # App name
    name = "MOTS SECRETS"
    bbox = draw.textbbox((0, 0), name, font=font_big)
    tw = bbox[2] - bbox[0]
    alpha = int(255 * min(1, t_ratio * 3))
    draw.text(((W - tw) // 2, H // 2 - 100), name,
              fill=(*PURPLE, alpha), font=font_big)

    # Download CTA
    cta = "\U0001f4f1 TÉLÉCHARGEZ GRATUITEMENT"
    bbox2 = draw.textbbox((0, 0), cta, font=font_med)
    tw2 = bbox2[2] - bbox2[0]
    cta_alpha = int(255 * min(1, max(0, (t_ratio - 0.3) * 3)))
    draw.text(((W - tw2) // 2, H // 2 + 20), cta,
              fill=(*NEON_GREEN, cta_alpha), font=font_med)

    # Stores
    stores = "Disponible sur Android"
    bbox3 = draw.textbbox((0, 0), stores, font=font_small)
    tw3 = bbox3[2] - bbox3[0]
    stores_alpha = int(255 * min(1, max(0, (t_ratio - 0.5) * 3)))
    draw.text(((W - tw3) // 2, H // 2 + 100), stores,
              fill=(*LIGHT_LAVENDER, stores_alpha), font=font_small)

    # Pulse ring animation
    if t_ratio > 0.4:
        pulse = (t_ratio - 0.4) * 3
        ring_r = int(150 + pulse * 100)
        ring_alpha = max(0, int(180 * (1 - pulse)))
        draw.ellipse([
            W // 2 - ring_r, H // 2 - 350 - ring_r,
            W // 2 + ring_r, H // 2 - 350 + ring_r
        ], outline=(*PURPLE, ring_alpha), width=3)

    return np.array(bg.convert("RGB"))


# ── Main: Compose video ────────────────────────────────────────────

def make_video():
    print("\U0001f3ac Création de la vidéo promo Mots Secrets...")

    sections = [
        ("intro", 3.0, build_intro_frame),
        ("tagline", 2.0, build_tagline_frame),
        ("modes", 4.0, build_modes_frame),
        ("screenshots", 4.0, build_screenshots_frame),
        ("categories", 3.0, build_categories_frame),
        ("cta", 4.0, build_cta_frame),
    ]

    clips = []

    for name, duration, builder in sections:
        print(f"  \U0001f39e️  Rendering: {name} ({duration}s)...")

        def make_frame(t, b=builder, d=duration):
            ratio = min(1.0, max(0.0, t / d))
            return b(ratio)

        clip = VideoClip(make_frame, duration=duration)
        clip = clip.set_fps(FPS)
        clips.append(clip)

    # Concatenate all sections
    print("  \U0001f517 Concatenating sections...")
    final = concatenate_videoclips(clips, method="compose")

    # Add fade in/out
    final = final.fadein(1.0).fadeout(1.5)

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "promo_mots_secrets.mp4")
    print(f"  \U0001f4be Exporting to {output_path}...")
    final.write_videofile(
        output_path,
        fps=FPS,
        codec="libx264",
        audio=False,
        preset="medium",
        bitrate="5000k",
        logger="bar"
    )

    print(f"\n✅ Vidéo créée avec succès : {output_path}")
    print(f"   Durée : {final.duration:.1f}s | Format : 1080x1920 (9:16)")
    return output_path


if __name__ == "__main__":
    make_video()