import cv2
import numpy as np
import os

images = [
    "WellFi_Red.jpg",
    "WellFi_Logo_1.jpg",
    "WellFi_Marketing_Reveal.jpg",
    "final-no-text-square-1200x1200.png"
]

base_dir = r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images"

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
    
    # average around the brightest point (50x50 region)
    x, y = max_loc
    x_start = max(0, x - 25)
    x_end = min(w, x + 25)
    y_start = max(0, y - 25)
    y_end = min(h, y + 25)
    region = img[y_start:y_end, x_start:x_end]
    avg_bgr_region = np.mean(region, axis=(0, 1))
    
    print(f"{name}: size={w}x{h}, max_val={max_val} at {max_loc}, region_avg_bgr_around_brightest={avg_bgr_region}")
