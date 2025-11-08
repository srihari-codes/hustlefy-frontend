import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
    }, 2400); // Start fade at 2.43s (1000ms before end)

    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, 3400);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-1000 ease-in-out ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        className="h-full w-full object-cover"
        src="/assets/videos/Hustlefy_Splash_Screeen.mp4"
        autoPlay
        muted
        playsInline
      />
    </div>
  );
};

export default SplashScreen;
