import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * AdMob Banner Component
 * Shows a native AdMob banner on mobile (Capacitor) and a subtle placeholder on web.
 * The banner is anchored to the very bottom of the viewport, below the tab navigation.
 */
const AD_UNIT_ID = "ca-app-pub-1738990657158019/5477094474";
const BANNER_HEIGHT = 50; // Standard banner height
// Keep true while testing; set to false for the official production/store release.
const IS_TESTING = true;

const AdMobBanner = () => {
  const [isNative, setIsNative] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    const isNativePlatform = Capacitor.isNativePlatform();
    setIsNative(isNativePlatform);

    if (isNativePlatform) {
      initAdMob();
    }

    return () => {
      if (isNativePlatform) {
        removeBanner();
      }
    };
  }, []);

  const initAdMob = async () => {
    try {
      const { AdMob, BannerAdSize, BannerAdPosition } = await import(
        "@capacitor-community/admob"
      );

      await AdMob.initialize({
        initializeForTesting: IS_TESTING,
      });

      await AdMob.showBanner({
        adId: AD_UNIT_ID,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: IS_TESTING,
      });

      setBannerVisible(true);
    } catch (error) {
      console.warn("[AdMob] Banner failed to load:", error);
    }
  };

  const removeBanner = async () => {
    try {
      const { AdMob } = await import("@capacitor-community/admob");
      await AdMob.removeBanner();
    } catch (error) {
      console.warn("[AdMob] Banner removal error:", error);
    }
  };

  // On native, the banner is rendered natively at the bottom — we just need a spacer
  if (isNative && bannerVisible) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 z-[60]"
        style={{ height: BANNER_HEIGHT }}
      >
        <div className="h-px w-full bg-border/30" />
        <div
          className="w-full bg-background/80 backdrop-blur-sm"
          style={{ height: BANNER_HEIGHT }}
        />
      </div>
    );
  }

  // On web, show a subtle placeholder so the ad slot position stays visible
  if (!isNative) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[60]">
        <div className="h-px w-full bg-border/20" />
        <div
          className="w-full flex items-center justify-center bg-muted/40 backdrop-blur-sm"
          style={{ height: BANNER_HEIGHT }}
        >
          <span className="text-[10px] text-muted-foreground/40 tracking-wider uppercase">
            AdMob Banner Placeholder — Android Preview
          </span>
        </div>
      </div>
    );
  }

  return null;
};

export { BANNER_HEIGHT };
export default AdMobBanner;
