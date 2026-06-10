import re

def main():
    path = r"C:\Users\kyle\MPS\wellfi-marketing\site\src\app\globals.css"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Update variable definitions
    content = content.replace("--em-cyan: #06B6D4;", "--em-cyan: #EF4444;")
    content = content.replace("--em-glow: #22D3EE;", "--em-glow: #F87171;")

    # 2. Update rgba(6, 182, 212, ...) -> rgba(239, 68, 68, ...)
    content = re.sub(r"rgba\(\s*6,\s*182,\s*212", "rgba(239, 68, 68", content)

    # 3. Update rgba(34, 211, 238, ...) -> rgba(248, 113, 113, ...)
    content = re.sub(r"rgba\(\s*34,\s*211,\s*238", "rgba(248, 113, 113", content)

    # 4. Update the #0891b2 in button primary gradient
    content = content.replace("var(--em-cyan) 0%, #0891b2 100%", "var(--em-cyan) 0%, #B91C1C 100%")

    # 5. Update .hero-candle-glow gradient colors
    old_glow_gradient_1 = """  background: radial-gradient(
    circle 28rem at 50% 72%,
    rgba(120, 244, 255, 0.55) 0%,
    rgba(79, 183, 199, 0.32) 22%,
    rgba(79, 183, 199, 0.14) 48%,
    rgba(79, 183, 199, 0.04) 72%,
    rgba(2, 4, 8, 0) 90%
  );"""

    new_glow_gradient_1 = """  background: radial-gradient(
    circle 28rem at 50% 72%,
    rgba(252, 241, 233, 0.55) 0%,
    rgba(239, 68, 68, 0.32) 22%,
    rgba(220, 38, 38, 0.14) 48%,
    rgba(153, 27, 27, 0.04) 72%,
    rgba(2, 4, 8, 0) 90%
  );"""

    content = content.replace(old_glow_gradient_1, new_glow_gradient_1)

    old_glow_gradient_2 = """    background: radial-gradient(
      circle 18rem at 50% 65%,
      rgba(120, 244, 255, 0.55) 0%,
      rgba(79, 183, 199, 0.32) 22%,
      rgba(79, 183, 199, 0.14) 48%,
      rgba(79, 183, 199, 0.04) 72%,
      rgba(2, 4, 8, 0) 90%
    );"""

    new_glow_gradient_2 = """    background: radial-gradient(
      circle 18rem at 50% 65%,
      rgba(252, 241, 233, 0.55) 0%,
      rgba(239, 68, 68, 0.32) 22%,
      rgba(220, 38, 38, 0.14) 48%,
      rgba(153, 27, 27, 0.04) 72%,
      rgba(2, 4, 8, 0) 90%
    );"""

    content = content.replace(old_glow_gradient_2, new_glow_gradient_2)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
    print("globals.css updated successfully!")

if __name__ == '__main__':
    main()
