import os
import time

def check():
    public_dir = r"C:\Users\kyle\MPS\wellfi-marketing\site\public"
    files = [
        "hero-landscape.png", "hero-lit-landscape.png",
        "hero-v2-portrait.png", "hero-lit-portrait.png",
        "hero-square.png", "hero-lit-square.png",
        "hero-v2-square.png"
    ]
    for f in files:
        path = os.path.join(public_dir, f)
        if os.path.exists(path):
            mtime = os.path.getmtime(path)
            print(f"{f}: modified at {time.ctime(mtime)}, size={os.path.getsize(path)}")
        else:
            print(f"{f}: not found")

if __name__ == '__main__':
    check()
