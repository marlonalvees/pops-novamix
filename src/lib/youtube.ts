export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    let videoId: string | null = null;

    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      videoId = parsed.searchParams.get("v");
    }

    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
