#!/bin/bash

# Villa Image Gallery Structure Creator
# Usage: ./create-villa-folders.sh villa-name

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 villa-name"
    echo "Example: $0 new-villa"
    exit 1
fi

VILLA_NAME=$1
BASE_DIR="public/villas/$VILLA_NAME"

# Create base villa directory
mkdir -p "$BASE_DIR"

# Create all category directories
categories=("hero" "ext" "liv" "din" "kit" "bed1" "bed2" "bed3" "bed4" "bed5" "bath1" "bath2" "bath3" "bath4" "pool" "view" "amen")

for category in "${categories[@]}"; do
    mkdir -p "$BASE_DIR/$category"
    echo "Created: $BASE_DIR/$category"
done

echo ""
echo "✅ Successfully created villa folder structure for: $VILLA_NAME"
echo ""
echo "📁 Directory structure:"
echo "$BASE_DIR/"
for category in "${categories[@]}"; do
    echo "├── $category/"
done
echo ""
echo "📝 Next steps:"
echo "1. Add your images to the appropriate category folders"
echo "2. Update the villa data in VillaDetailClient.tsx"
echo "3. Add the gallery object with your image paths"
echo ""
echo "💡 Tip: Use descriptive filenames like 'hero-1.jpg', 'living-main.jpg', etc."