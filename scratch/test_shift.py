import cv2
import numpy as np

path = r"C:\Users\kyle\MPS\wellfi-marketing\site\public\tool-closeup.png"
img = cv2.imread(path)
if img is not None:
    b = img[:, :, 0].astype(np.float32)
    g = img[:, :, 1].astype(np.float32)
    r = img[:, :, 2].astype(np.float32)
    
    cyan_mask = (b > r + 15) & (g > r + 5) & ((b + g) > 50)
    indices = np.argwhere(cyan_mask)
    print(f"Found {len(indices)} cyan pixels.")
    if len(indices) > 0:
        print("First 10 cyan pixels (BGR):")
        for idx in indices[:10]:
            y, x = idx
            print(f"({x}, {y}): B={img[y, x, 0]}, G={img[y, x, 1]}, R={img[y, x, 2]}")
else:
    print("Could not load image.")
