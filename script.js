const form = document.querySelector("#download-form");
const urlInput = document.querySelector("#video-url");
const rightsConfirmation = document.querySelector("#rights-confirmation");
const message = document.querySelector("#form-message");
const pasteButton = document.querySelector("#paste-button");
const resultCard = document.querySelector("#result-card");
const resultThumb = document.querySelector("#result-thumb");
const resultTitle = document.querySelector("#result-title");
const resultAuthor = document.querySelector("#result-author");
const resetButton = document.querySelector("#reset-button");
const submitButton = form.querySelector(".primary-button");
const downloadLink = document.querySelector("#download-link");

function getYouTubeId(value) {
  try {
    const parsedUrl = new URL(value.trim());
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] || null;
    }

    if (!["youtube.com", "m.youtube.com", "music.youtube.com"].includes(hostname)) {
      return null;
    }

    if (parsedUrl.pathname === "/watch") {
      return parsedUrl.searchParams.get("v");
    }

    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    if (["shorts", "live", "embed"].includes(pathParts[0])) {
      return pathParts[1] || null;
    }

    return null;
  } catch {
    return null;
  }
}

function setMessage(text, type = "error") {
  message.textContent = text;
  message.style.color = type === "success" ? "#18784a" : "#c33636";
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("is-loading", isLoading);
  submitButton.querySelector("span").textContent = isLoading ? "Checking" : "Check my video";
}

async function getPublicVideoDetails(videoUrl) {
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", videoUrl);
  endpoint.searchParams.set("format", "json");

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("Metadata unavailable");
  return response.json();
}

pasteButton.addEventListener("click", async () => {
  try {
    const clipboardText = await navigator.clipboard.readText();
    urlInput.value = clipboardText;
    urlInput.focus();
    setMessage(clipboardText ? "Link pasted — confirm your rights, then check it." : "Your clipboard is empty.", "success");
  } catch {
    urlInput.focus();
    setMessage("Clipboard access is blocked. Paste your link manually.");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const videoId = getYouTubeId(urlInput.value);

  if (!videoId || !/^[a-zA-Z0-9_-]{6,20}$/.test(videoId)) {
    setMessage("Enter a valid YouTube, YouTube Shorts, or youtu.be link.");
    urlInput.focus();
    return;
  }

  if (!rightsConfirmation.checked) {
    setMessage("Confirm that you own the video or have permission to save it.");
    rightsConfirmation.focus();
    return;
  }

  setLoading(true);
  setMessage("Looking up public video details…", "success");

  const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = "Your YouTube video";
  let author = "Public details are unavailable, but the link looks valid.";
  let thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  try {
    const details = await getPublicVideoDetails(normalizedUrl);
    title = details.title || title;
    author = details.author_name ? `Uploaded by ${details.author_name}` : author;
    thumbnail = details.thumbnail_url || thumbnail;
  } catch {
    // A valid link can still be private or block public metadata.
  }

  resultTitle.textContent = title;
  resultAuthor.textContent = author;
  resultThumb.src = thumbnail;
  resultThumb.alt = `Thumbnail for ${title}`;
  const downloadPageUrl = new URL("download.html", window.location.href);
  downloadPageUrl.searchParams.set("video", normalizedUrl);
  downloadPageUrl.searchParams.set("id", videoId);
  downloadLink.href = downloadPageUrl.toString();
  form.hidden = true;
  resultCard.hidden = false;
  setLoading(false);
  setMessage("");
});

resetButton.addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  resultCard.hidden = true;
  resultThumb.removeAttribute("src");
  setMessage("");
  urlInput.focus();
});

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((otherDetail) => {
      if (otherDetail !== detail) otherDetail.open = false;
    });
  });
});
