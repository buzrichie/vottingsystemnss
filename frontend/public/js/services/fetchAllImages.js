import { getAdminToken, getToken } from "./tokenManager.js";

let cachedImageList = null;

export async function fetchAllImageFiles() {
  if (!getToken() || !getAdminToken()) return;
  if (!cachedImageList) {
    const res = await fetch("/assets-list");
    const files = await res.json();
    cachedImageList = files;
  }
  cachedImageList.forEach((file) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = `/images/${file}`;
    document.head.appendChild(link);
  });
}
