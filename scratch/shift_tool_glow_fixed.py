import os
import shutil
from PIL import Image

def shift_cyan_to_red():
    img_path = r"C:\Users\kyle\MPS\wellfi-marketing\site\public\tool-closeup.png"
    backup_path = r"C:\Users\kyle\MPS\wellfi-marketing\site\public\tool-closeup-backup.png"
    
    if not os.path.exists(img_path):
        print("Error: tool-closeup.png not found")
        return
        
    # Create a backup
    shutil.copy2(img_path, backup_path)
    print(f"Backed up to {backup_path}")
    
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    pixels = img.load()
    changed_count = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:
                # Cyan/blue detection from check_cyan.py:
                # b > r + 15 and g > r + 5 and (b + g) > 50
                # Let's use a slightly wider threshold to catch any faint cyan/blue halos too.
                is_cyan = (b > r + 10) and (g > r + 3) and ((b + g) > 40)
                
                if is_cyan:
                    # Shift it to red/orange.
                    new_r = int(max(g, b) * 1.1)
                    if new_r > 255: new_r = 255
                    
                    # Muted green/blue for red-orange/steel glow
                    new_g = int(r * 0.4 + g * 0.1)
                    new_b = int(r * 0.4 + b * 0.1)
                    
                    pixels[x, y] = (new_r, new_g, new_b, a)
                    changed_count += 1
                    
    img.save(img_path, "PNG")
    print(f"Shuffled {changed_count} pixels from cyan to red/orange.")

if __name__ == '__main__':
    shift_cyan_to_red()
