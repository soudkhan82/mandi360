export type ListingImageInput = {
  image_urls?: string[] | string | null;
  image_url?: string | null;
  image?: string | null;
  first_image?: string | null;
};

type ImageValue = string[] | string | null | undefined;

function isValidImageUrl(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeImageUrl(value: string) {
  const clean = value.trim();

  if (!clean) return null;

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  if (clean.startsWith("/")) {
    return clean;
  }

  return clean;
}

function parseImageUrls(value: string): string[] {
  const clean = value.trim();

  if (!clean) return [];

  try {
    const parsed: unknown = JSON.parse(clean);

    if (Array.isArray(parsed)) {
      return parsed
        .filter(isValidImageUrl)
        .map(normalizeImageUrl)
        .filter((url): url is string => Boolean(url));
    }

    if (isValidImageUrl(parsed)) {
      const normalized = normalizeImageUrl(parsed);
      return normalized ? [normalized] : [];
    }
  } catch {
    // keep going to fallback formats
  }

  if (clean.startsWith("{") && clean.endsWith("}")) {
    return clean
      .slice(1, -1)
      .split(",")
      .map((item) => item.replace(/^"|"$/g, "").trim())
      .filter(isValidImageUrl)
      .map(normalizeImageUrl)
      .filter((url): url is string => Boolean(url));
  }

  if (clean.includes(",")) {
    return clean
      .split(",")
      .map((item) => item.trim())
      .filter(isValidImageUrl)
      .map(normalizeImageUrl)
      .filter((url): url is string => Boolean(url));
  }

  const normalized = normalizeImageUrl(clean);
  return normalized ? [normalized] : [];
}

function imagesFromValue(value: ImageValue): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(isValidImageUrl)
      .map(normalizeImageUrl)
      .filter((url): url is string => Boolean(url));
  }

  if (typeof value === "string") {
    return parseImageUrls(value);
  }

  return [];
}

export function getListingImages(listing: ListingImageInput): string[] {
  const fromImageUrls = imagesFromValue(listing.image_urls);

  if (fromImageUrls.length > 0) {
    return fromImageUrls;
  }

  return [listing.first_image, listing.image_url, listing.image]
    .filter(isValidImageUrl)
    .map(normalizeImageUrl)
    .filter((url): url is string => Boolean(url));
}

export function getListingPreviewUrl(
  listing: ListingImageInput,
): string | null {
  const images = getListingImages(listing);
  return images.length > 0 ? images[0] : null;
}

export function getPublicImage(
  input: ImageValue | ListingImageInput,
): string | null {
  if (
    typeof input === "object" &&
    input !== null &&
    !Array.isArray(input) &&
    ("image_urls" in input ||
      "image_url" in input ||
      "image" in input ||
      "first_image" in input)
  ) {
    return getListingPreviewUrl(input);
  }

  return getListingPreviewUrl({
    image_urls: input as ImageValue,
  });
}
