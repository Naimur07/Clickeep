const searchParams = new URLSearchParams(window.location.search);
const videoId = searchParams.get("id");
const suppliedVideoUrl = searchParams.get("video");
const validVideoId = videoId && /^[a-zA-Z0-9_-]{6,20}$/.test(videoId) ? videoId : null;
const normalizedVideoUrl = validVideoId ? `https://www.youtube.com/watch?v=${validVideoId}` : null;
const videoUrl = suppliedVideoUrl === normalizedVideoUrl ? suppliedVideoUrl : normalizedVideoUrl;

const thumbnail = document.querySelector("#selected-thumb");
const title = document.querySelector("#selected-title");
const watchLink = document.querySelector("#watch-link");

if (validVideoId && videoUrl) {
  thumbnail.src = `https://i.ytimg.com/vi/${validVideoId}/mqdefault.jpg`;
  watchLink.href = videoUrl;

  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", videoUrl);
  endpoint.searchParams.set("format", "json");

  fetch(endpoint)
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((details) => {
      title.textContent = details.title || "YouTube video";
      thumbnail.alt = `Thumbnail for ${details.title || "selected YouTube video"}`;
    })
    .catch(() => {
      title.textContent = "YouTube video";
    });
} else {
  document.querySelector("#selected-video").hidden = true;
  watchLink.removeAttribute("href");
}
