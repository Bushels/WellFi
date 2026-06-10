import os
import shutil
from PIL import Image

def shift_cyan_to_red():
    img_path = r"C:\Users\kyle\MPS\wellfi-marketing\site\public\images\wellfi-signal-dark.jpeg"
    backup_path = r"C:\Users\kyle\MPS\wellfi-marketing\site\public\images\wellfi-signal-dark-backup.jpeg"
    
    if not os.path.exists(img_path):
        print("Error: wellfi-signal-dark.jpeg not found")
        return
        
    # Create a backup if it doesn't exist
    if not os.path.exists(backup_path):
        shutil.copy2(img_path, backup_path)
        print(f"Backed up to {backup_path}")
    else:
        print("Backup already exists")
    
    img = Image.open(img_path).convert("RGB")
    width, height = img.size
    
    pixels = img.load()
    changed_count = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            
            # Cyan/blue detection: Blue and Green are high, Red is lower.
            # Specifically, if Blue > Red or Green > Red and they are not very dark gray/white.
            if (b > r + 10 or g > r + 10) and (b + g) > 2 * r and (b > 20 or g > 20):
                # Shift it to red/orange.
                new_r = int(max(g, b) * 1.1)
                if new_r > 255: new_r = 255
                # Muted green/blue for red-orange glow
                new_g = int(r * 0.4 + g * 0.1)
                new_b = int(r * 0.4 + b * 0.1)
                
                pixels[x, y] = (new_r, new_g, new_b)
                changed_count += 1
                
    img.save(img_path, "JPEG", quality=95)
    print(f"Shuffled {changed_count} pixels from cyan to red/orange and saved.")

if __name__ == '__main__':
    shift_cyan_to_red()
