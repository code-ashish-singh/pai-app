from PIL import Image, ImageChops
import sys

def crop_empty_space(img_path):
    img = Image.open(img_path).convert("RGBA")
    
    # Assume background is the color at (0,0)
    bg_color = img.getpixel((0,0))
    
    # Create a background image
    bg = Image.new(img.mode, img.size, bg_color)
    
    # Find difference
    diff = ImageChops.difference(img, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    
    bbox = diff.getbbox()
    
    if bbox:
        img = img.crop(bbox)
        
    # Now make it square by padding
    width, height = img.size
    max_dim = max(width, height)
    
    # Add 10% padding
    pad = int(max_dim * 0.1)
    new_dim = max_dim + pad * 2
    
    bg_color_pad = bg_color
    if bg_color[3] == 0:
        bg_color_pad = (0,0,0,0) # true transparent
        
    squared_img = Image.new(img.mode, (new_dim, new_dim), bg_color_pad)
    squared_img.paste(img, ((new_dim - width) // 2, (new_dim - height) // 2))
    
    return squared_img

try:
    icon = crop_empty_space("public/icons/image.png")
    icon.resize((192, 192), Image.Resampling.LANCZOS).save("public/icons/icon-192.png")
    icon.resize((512, 512), Image.Resampling.LANCZOS).save("public/icons/icon-512.png")
    print("Icons generated successfully.")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
