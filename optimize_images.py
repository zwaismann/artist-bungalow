import os
import glob
from PIL import Image

# Setup directories
source_dir = "/Users/zeevwaismann/Desktop/Claude/Projects/Artist Bungalow (Airbnb)/Website/property_edited"
target_dir = "/Users/zeevwaismann/Desktop/Claude/Projects/Artist Bungalow (Airbnb)/Website/property_optimized"

# Ensure target exists
os.makedirs(target_dir, exist_ok=True)

print("Starting Image Optimization to WebP...")

# 1. Optimize the Gallery & Property Photos
png_files = glob.glob(os.path.join(source_dir, "*.png"))
print(f"Found {len(png_files)} PNG files in property_edited to optimize...")

for file_path in png_files:
    filename = os.path.basename(file_path)
    name_without_ext = os.path.splitext(filename)[0]
    webp_filename = f"{name_without_ext}.webp"
    webp_path = os.path.join(target_dir, webp_filename)
    
    try:
        img = Image.open(file_path)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(webp_path, "WEBP", quality=80, method=6)
        print(f"  Optimized: {filename} -> {webp_filename}")
    except Exception as e:
        print(f"  Error converting {filename}: {e}")

# 2. Fix and Optimize the Paseo Survey Sketch that failed to deploy on Vercel
survey_source = "/Users/zeevwaismann/Desktop/Claude/Projects/Artist Bungalow (Airbnb)/Images/Paseo Survey Drawing/Airbnb_Gemini 3 (Nano Banana Pro)_2026-02-23_01-23-09.png"
survey_target = os.path.join(target_dir, "paseo_survey.webp")

if os.path.exists(survey_source):
    try:
        print(f"Fetching outer survey sketch to include in Website build...")
        img = Image.open(survey_source)
        # Keep RGBA for the survey drawing to maintain any transparency if we need it, though WebP supports it.
        # Actually, let's just save it. The mask handles fading, but if there's native transparency we want it.
        img.save(survey_target, "WEBP", quality=85, method=6)
        print(f"  Successfully fixed and optimized Survey Sketch -> paseo_survey.webp")
    except Exception as e:
        print(f"  Error fixing survey sketch: {e}")
else:
    print("  Warning: Could not find the original Paseo Survey Drawing!")

print("\nAll done! You can now deploy the optimized site.")
