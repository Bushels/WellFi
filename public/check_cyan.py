import cv2
import numpy as np
import os

images = {
    "wellfi-signal-dark.jpeg": r"C:\Users\kyle\MPS\wellfi-marketing\site\public\images\wellfi-signal-dark.jpeg",
    "tool-closeup.png": r"C:\Users\kyle\MPS\wellfi-marketing\site\public\tool-closeup.png"
}

for name, path in images.items():
    if not os.path.exists(path):
        print(f"{name} does not exist at {path}")
        continue
    img = cv2.imread(path)
    if img is None:
        print(f"Failed to load {name}")
        continue
    
    h, w, c = img.shape
    
    # Let's count how many pixels look cyan/blue.
    # We define cyan/blue as Blue > Red + 20 and Green > Red + 10 (or similar)
    # BGR format in OpenCV: img[:, :, 0] is Blue, img[:, :, 1] is Green, img[:, :, 2] is Red
    b = img[:, :, 0].astype(np.float32)
    g = img[:, :, 1].astype(np.float32)
    r = img[:, :, 2].astype(np.float32)
    
    cyan_mask = (b > r + 15) & (g > r + 5) & ((b + g) > 50)
    cyan_count = np.sum(cyan_mask)
    cyan_pct = (cyan_count / (w * h)) * 100
    
    avg_b = np.mean(b)
    avg_g = np.mean(g)
    avg_r = np.mean(r)
    
    print(f"{name}: size={w}x{h}, avg_bgr=({avg_b:.2f}, {avg_g:.2f}, {avg_r:.2f}), cyan_pixels={cyan_count} ({cyan_pct:.3f}%)")
