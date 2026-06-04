/**
 * Helper function to safely format and resolve image URLs.
 * Ensures that outdated or invalid URL formats (like HTML endpoints)
 * are mapped to their correct direct-image equivalents.
 * 
 * @param url The raw image URL from the database
 * @returns The resolved image URL safe for <img> src tags
 */
export const getDisplayImageUrl = (url?: string | null): string => {
  if (!url) return "";
  
  // Fix for Pollinations AI URLs that return HTML instead of images
  if (url.startsWith("https://pollinations.ai/p/")) {
    return url.replace(
      "https://pollinations.ai/p/", 
      "https://image.pollinations.ai/prompt/"
    );
  }
  
  return url;
};
