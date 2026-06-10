import cv2
import numpy as np

path = r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images\WellFi_Red.jpg"
img = cv2.imread(path)
if img is not None:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    total_pixels = gray.size
    
    # Check pixels at different brightness levels
    p_dark = np.sum(gray < 10) / total_pixels * 100
    p_dim = np.sum((gray >= 10) & (gray < 50)) / total_pixels * 100
    p_mid = np.sum((gray >= 50) & (gray < 150)) / total_pixels * 100
    p_bright = np.sum(gray >= 150) / total_pixels * 100
    
    print(f"WellFi_Red.jpg pixel brightness distribution:")
    print(f"  Very dark (<10): {p_dark:.2f}%")
    print(f"  Dim (10-50): {p_dim:.2f}%")
    print(f"  Medium (50-150): {p_mid:.2f}%")
    print(f"  Bright (>=150): {p_bright:.2f}%")
    
    # Let's check average color of the outer boundary (e.g. first/last 10 rows/cols)
    edge_pixels = []
    edge_pixels.extend(img[0, :, :].tolist())
    edge_pixels.extend(img[-1, :, :].tolist())
    edge_pixels.extend(img[:, 0, :].tolist())
    edge_pixels.extend(img[:, -1, :].tolist())
    edge_avg = np.mean(edge_pixels, axis=0)
    print(f"  Edge average BGR: {edge_avg}")
else:
    print("Failed to load image")
