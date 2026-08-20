export function getVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("drive.google.com")) {
      const fileIdFromPath = parsed.pathname.match(/\/d\/([^/]+)/)?.[1];
      const fileId = fileIdFromPath ?? parsed.searchParams.get("id");
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
    }

    return null;
  } catch {
    return null;
  }
}
