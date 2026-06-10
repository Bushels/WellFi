import cv2
import numpy as np
import os

images_to_check = {
    "WellFi_Red": r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images\WellFi_Red.jpg",
    "WellFi_Logo_1": r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images\WellFi_Logo_1.jpg",
    "WellFi_Marketing_Reveal": r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images\WellFi_Marketing_Reveal.jpg",
    "public_hero_landscape": r"C:\Users\kyle\MPS\wellfi-marketing\site\public\hero-landscape.png",
    "public_hero_lit_landscape": r"C:\Users\kyle\MPS\wellfi-marketing\site\public\hero-lit-landscape.png",
    "public_hero_square": r"C:\Users\kyle\MPS\wellfi-marketing\site\public\hero-square.png",
    "public_hero_lit_square": r"C:\Users\kyle\MPS\wellfi-marketing\site\public\hero-lit-square.png",
}

for name, path in images_to_check.items():
    if not os.path.exists(path):
        print(f"{name}: NOT FOUND at {path}")
        continue
    img = cv2.imread(path)
    if img is None:
        print(f"{name}: Failed to load at {path}")
        continue
    h, w, c = img.shape
    # calculate average channels (BGR)
    avg_b = np.mean(img[:, :, 0])
    avg_g = np.mean(img[:, :, 1])
    avg_r = np.mean(img[:, :, 2])
    print(f"{name}: size={w}x{h}, channels={c}, avg_bgr=({avg_b:.2f}, {avg_g:.2f}, {avg_r:.2f})")
