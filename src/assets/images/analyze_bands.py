import cv2
import numpy as np

path = r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images\WellFi_Red.jpg"
img = cv2.imread(path)
if img is not None:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # Calculate average brightness for horizontal bands of 10% height
    band_h = h // 10
    print("Vertical brightness profile of WellFi_Red.jpg:")
    for i in range(10):
        y_start = i * band_h
        y_end = (i + 1) * band_h
        avg_brightness = np.mean(gray[y_start:y_end, :])
        max_brightness = np.max(gray[y_start:y_end, :])
        print(f"  Band {i} (y={y_start} to {y_end}): avg={avg_brightness:.2f}, max={max_brightness:.2f}")
else:
    print("Failed to load image")
