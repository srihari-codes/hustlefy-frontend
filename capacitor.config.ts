import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hustlefy.app",
  appName: "Hustlefy",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
