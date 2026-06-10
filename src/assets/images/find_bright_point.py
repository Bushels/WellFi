import cv2
import numpy as np

path = r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images\WellFi_Red.jpg"
img = cv2.imread(path)
if img is None:
    print("Failed to load image")
else:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(gray)
    print(f"Brightest pixel value: {max_val} at (x, y) = {max_loc}")
    
    # Let's also find the center of gravity of the brightest region (e.g. threshold > 240)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)
    M = cv2.moments(thresh)
    if M["m00"] != 0:
        cX = int(M["m10"] / M["m00"])
        cY = int(M["m01"] / M["m00"])
        print(f"Center of gravity of bright region (>240): ({cX}, {cY})")
    else:
        print("No pixels with value > 240")
