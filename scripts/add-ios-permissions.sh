#!/bin/bash
# Script to add iOS permissions to Info.plist after Capacitor init

PLIST_PATH="ios/App/App/Info.plist"

# Check if Info.plist exists
if [ ! -f "$PLIST_PATH" ]; then
  echo "Info.plist not found. Run 'npx cap add ios' first."
  exit 1
fi

# Add permissions using PlistBuddy
/usr/libexec/PlistBuddy -c "Add :NSCameraUsageDescription string 'KoeTekt uses the camera to capture images for 3D scene generation.'" "$PLIST_PATH" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :NSCameraUsageDescription 'KoeTekt uses the camera to capture images for 3D scene generation.'" "$PLIST_PATH"

/usr/libexec/PlistBuddy -c "Add :NSMicrophoneUsageDescription string 'KoeTekt uses the microphone for voice-controlled scene direction.'" "$PLIST_PATH" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :NSMicrophoneUsageDescription 'KoeTekt uses the microphone for voice-controlled scene direction.'" "$PLIST_PATH"

/usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryUsageDescription string 'KoeTekt accesses the photo library to import images for 3D scene generation.'" "$PLIST_PATH" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryUsageDescription 'KoeTekt accesses the photo library to import images for 3D scene generation.'" "$PLIST_PATH"

/usr/libexec/PlistBuddy -c "Add :NSPhotoLibraryAddUsageDescription string 'KoeTekt saves captured scenes and recordings to your photo library.'" "$PLIST_PATH" 2>/dev/null || \
/usr/libexec/PlistBuddy -c "Set :NSPhotoLibraryAddUsageDescription 'KoeTekt saves captured scenes and recordings to your photo library.'" "$PLIST_PATH"

echo "iOS permissions added successfully!"
