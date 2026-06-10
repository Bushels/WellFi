import cv2
import numpy as np
import os

images = [
    "hero-v2-portrait.png",
    "hero-lit-portrait.png",
    "hero-square.png",
    "hero-lit-square.png",
    "hero-landscape.png",
    "hero-lit-landscape.png"
]

base_dir = r"C:\Users\kyle\MPS\wellfi-marketing\site\public"

for name in images:
    path = os.path.join(base_dir, name)
    if not os.path.exists(path):
        print(f"{name} does not exist")
        continue
    img = cv2.imread(path)
    if img is None:
        print(f"Failed to load {name}")
        continue
    
    h, w, c = img.shape
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(gray)
    avg_bgr = np.mean(img, axis=(0,1))
    print(f"{name}: size={w}x{h}, max_val={max_val} at {max_loc}, avg_bgr={avg_bgr}")
