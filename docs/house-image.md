# Make your own 3D house picture

The card looks best with an **isometric cut-away render** of your home, at night, with all lights on (the card darkens rooms itself – it can't make dark rooms brighter).

## With an AI image generator

Use any image generator (ChatGPT / DALL·E, Midjourney, Gemini, Stable Diffusion…). Describe your real layout, floor by floor. Example prompt:

```
Isometric 3D cut-away of a two-storey house at night, dark navy background,
roof removed, glowing blue neon edge lines along walls and floors.
Upstairs (left to right): master bedroom with a double bed, bathroom with a
glass shower and bathtub, storage room with wardrobes, kid's bedroom with a desk
and pink LED strip. Downstairs: WC with a sink, hallway with glowing LED stairs,
kitchen with island and dining table, open living room with an L-shaped sofa and
a large wall TV. All interior lights on, warm 2700K lighting, realistic materials,
photorealistic, high detail, no text, no labels, no people, 16:9.
```

Tips

- Ask for **no text and no labels** – the card draws its own live labels.
- Keep a **dark background**, it blends with the glass UI and the night sky.
- **Lights on everywhere**, TVs on (the card can black out a TV screen, but not light it up).
- Export as **WebP** (~100–300 KB) and put it in `/config/www/living-house/house.webp`.
- Then run the [calibration mode](calibration.md).

## Room photos for the rooms card

Any photo works – a real photo of the room, an AI render, or a crop of your 3D house (upscaled). Landscape or square, ~1200 px, WebP/JPG.
