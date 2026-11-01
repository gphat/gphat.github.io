export const SITE_TITLE = "One Mo' 'Gin";
// The meta description for pages without their own, and the feed's.
export const SITE_DESCRIPTION = "Field notes on systems and sound, by Cory Watson.";
// Link-preview cards (src/lib/og.ts), the size the big previews want.
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const EMAIL = "cory@onemogin.com";
export const GITHUB_USERNAME = "gphat";
export const LINKEDIN_USERNAME = "gphat";

// The Jekyll feed built its links and <guid>s from `url: http://onemogin.com`.
// Feed readers key items on the guid, so the feed keeps the http origin; a
// switch to https would show every post to every subscriber as new.
export const FEED_ORIGIN = "http://onemogin.com";
