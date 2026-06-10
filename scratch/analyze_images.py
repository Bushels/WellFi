import os
from PIL import Image

def analyze():
    img_dir = r"C:\Users\kyle\MPS\wellfi-marketing\site\src\assets\images"
    for filename in os.listdir(img_dir):
        path = os.path.join(img_dir, filename)
        if os.path.isfile(path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                img = Image.open(path)
                print(f"File: {filename}")
                print(f"  Size: {img.size}")
                print(f"  Format: {img.format}")
                print(f"  Mode: {img.mode}")
            else:
                print(f"File: {filename} (non-image or video, size={os.path.getsize(path)} bytes)")

if __name__ == '__main__':
    analyze()
