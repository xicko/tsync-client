# dev client build script for vphone jailbroken vm, TrollStore signs it itself.

\rm -rf ios/build/Build/Products/Debug-iphoneos

echo "Previous build cleared, starting build"

sleep 1

xcodebuild -workspace ios/*.xcworkspace -scheme "$(basename ios/*.xcworkspace .xcworkspace)" -configuration Debug -sdk iphoneos -derivedDataPath ios/build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY=""

sleep 3

echo "Packaging to .ipa in apps/rn/"
timestamp=$(date +%s)
cd ios/build/Build/Products/Debug-iphoneos && mkdir -p Payload && cp -R *.app Payload/ && zip -qry "../../../../../ios-dev-client-${timestamp}.ipa" Payload && cd -

sleep 1

\rm -rf ios/build/Build/Products/Debug-iphoneos
