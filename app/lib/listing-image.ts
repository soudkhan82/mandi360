export function getListingPreviewUrl(listing: {
  image_urls?: string[] | string | null;
}) {
  if (Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
    return listing.image_urls[0];
  }

  if (typeof listing.image_urls === "string") {
    try {
      const parsed = JSON.parse(listing.image_urls);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function getListingImages(listing: {
  image_urls?: string[] | string | null;
}) {
  if (Array.isArray(listing.image_urls)) {
    return listing.image_urls.filter(Boolean);
  }

  if (typeof listing.image_urls === "string") {
    try {
      const parsed = JSON.parse(listing.image_urls);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch {
      return [];
    }
  }

  return [];
}
