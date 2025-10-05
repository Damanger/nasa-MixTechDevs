import { useEffect, useMemo, useRef, useState, useId } from "react";
// Firebase (optional): used to upload images so they don't need to be embedded in the share URL.
// Requires setting PUBLIC_FIREBASE_CONFIG in your environment as a JSON string with at least apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId.
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref as storageRef, uploadString, uploadBytes, getDownloadURL } from "firebase/storage";
import "../assets/css/GalacticPostcardStudio.css";
import { DEFAULT_LANG } from "../i18n/translations.js";

const FALLBACK_STRINGS = {
  designHeading: "Pick a sketch",
  designDescription: "Browse six concepts inspired by nebulas and orbital stations.",
  messageHeading: "Customize your message",
  messageLabel: "Message",
  messagePlaceholder: "Write your cosmic wishes…",
  senderLabel: "Sender",
  senderPlaceholder: "Who is signing the postcard",
  photoHeading: "Add a photo",
  photoHint: "Square images (JPG or PNG) deliver the best result.",
  photoButton: "Choose image",
  photoRemove: "Remove photo",
  previewHeading: "Preview",
  previewNote: "The layout adapts automatically to the selected sketch.",
  sampleMessage: "May every new orbit bring us closer to the worlds we dream of exploring.",
  sampleSender: "MixTechDevs Crew",
  shareHeading: "Share your postcard",
  shareDescription: "Generate a temporary link so others can see this design.",
  shareButton: "Create link",
  createButton: "Create your postcard",
  shareGenerating: "Generating…",
  shareCopy: "Copy link",
  shareCopied: "Link copied!",
  shareError: "We couldn't create the link.",
  sharePreview: "Send this link to your crew so they can preview the card.",
  shareTooLarge: "Image is too large for a temporary link. Try a smaller file.",
  shareStale: "You've updated the postcard. Create a new link to share the changes.",
  shareViewingNotice: "You're viewing a shared postcard. Feel free to adjust it before re-sharing.",
  designs: [
    {
      id: "aurora",
      name: "Aurora Borealis",
      description: "Emerald and violet lights embrace the edge of your text.",
    },
    {
      id: "supernova",
      name: "Supernova Burst",
      description: "A golden stellar flash highlights the heart of your card.",
    },
    {
      id: "orbit",
      name: "Twin Orbit",
      description: "Two concentric orbits frame your photo and message.",
    },
    {
      id: "nebula",
      name: "Eternal Nebula",
      description: "Magenta and teal clouds swirl around the layout.",
    },
    {
      id: "signal",
      name: "Radar Signal",
      description: "Interplanetary communication waves amplify each word.",
    },
    {
      id: "station",
      name: "Orbital Module",
      description: "Modular panels and minimalist type evoke a space station.",
    },
  ],
};

export const DESIGN_CLASS_MAP = {
  aurora: "design-aurora",
  supernova: "design-supernova",
  orbit: "design-orbit",
  nebula: "design-nebula",
  signal: "design-signal",
  station: "design-station",
};

export const SHARE_PARAM = "share";
const PHOTO_DATA_LIMIT = 350000; // ~350 KB in base64 to keep URLs reasonable
const DEFAULT_SHARE_BASE = "https://nasa-mixtechdevs.vercel.app";
const SHARE_BASE_ENV = import.meta.env.PUBLIC_SHARE_BASE_URL;

export function encodePayload(payload) {
  try {
    const json = JSON.stringify(payload);
    // If payload includes a photo, always try compressing (keeps links short).
    const threshold = 1500; // characters — tuneable for non-photo payloads
    let final = json;
    let compressed = false;
    const hasPhoto = payload && typeof payload.p === "string" && payload.p.length > 0;
    const shouldCompress = hasPhoto || json.length > threshold;

    if (shouldCompress) {
      try {
        // compress to a URL-safe encoded string
        final = compressToEncodedURIComponent(json);
        compressed = true;
      } catch (err) {
        // fall back to raw JSON
        final = json;
        compressed = false;
      }
    }

    const utf8 = new TextEncoder().encode(final);
    let binary = "";
    utf8.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    // If we compressed, return the URL-safe compressed token directly (shortest).
    if (compressed) {
      return `c1:${final}`;
    }

    // Legacy: base64-encoded payload with CMP: prefix
    const base = btoa(binary);
    return `CMP:${base}`;
  } catch (error) {
    console.error("Failed to encode postcard payload", error);
    return null;
  }
}

export function decodePayload(value) {
  try {
    // New short URL-safe compressed token format: c1:<compressed>
    if (typeof value === "string" && value.startsWith("c1:")) {
      try {
        const compressedPart = value.slice(3);
        const json = decompressFromEncodedURIComponent(compressedPart);
        return JSON.parse(json);
      } catch (err) {
        console.error("Failed to decode c1 compressed payload", err);
        return null;
      }
    }

    // Legacy path: CMP: + base64-encoded (or raw base64)
    let compressed = false;
    let token = value;
    if (typeof token === "string" && token.startsWith("CMP:")) {
      compressed = true;
      token = token.slice(4);
    }

    const binary = atob(token);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const raw = new TextDecoder().decode(bytes);
    const json = compressed ? decompressFromEncodedURIComponent(raw) : raw;
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode postcard payload", error);
    return null;
  }
}

// --- Minimal LZ-based helpers (compressToEncodedURIComponent / decompressFromEncodedURIComponent)
// Small, self-contained implementation inspired by LZ-String (MIT). Only the encodedURIComponent helpers are implemented.
function compressToEncodedURIComponent(input) {
  if (input == null) return "";
  return _compress(input, 6, (a) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".charAt(a));
}

function decompressFromEncodedURIComponent(input) {
  if (input == null) return "";
  return _decompress(input.length, 32, (index) => {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".indexOf(input.charAt(index));
  });
}

function _compress(uncompressed, bitsPerChar, getCharFromInt) {
  if (uncompressed == null) return "";
  let i, value,
    context_dictionary = {},
    context_dictionaryToCreate = {},
    context_c = "",
    context_wc = "",
    context_w = "",
    context_enlargeIn = 2,
    context_dictSize = 3,
    context_numBits = 2,
    context_data = [],
    context_data_val = 0,
    context_data_position = 0;

  for (i = 0; i < uncompressed.length; i += 1) {
    context_c = uncompressed.charAt(i);
    if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
      context_dictionary[context_c] = context_dictSize++;
      context_dictionaryToCreate[context_c] = true;
    }

    context_wc = context_w + context_c;
    if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
      context_w = context_wc;
    } else {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        value = context_w.charCodeAt(0);
        for (let j = 0; j < context_numBits; j++) {
          context_data_val = (context_data_val << 1);
          if (context_data_position++ == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          }
        }
        for (let j = 0; j < 8; j++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position++ == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          }
          value = value >> 1;
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (let j = 0; j < context_numBits; j++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position++ == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          }
          value = value >> 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
      context_dictionary[context_wc] = context_dictSize++;
      context_w = String(context_c);
    }
  }

  if (context_w !== "") {
    if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
      value = context_w.charCodeAt(0);
      for (let j = 0; j < context_numBits; j++) {
        context_data_val = (context_data_val << 1);
        if (context_data_position++ == bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        }
      }
      for (let j = 0; j < 8; j++) {
        context_data_val = (context_data_val << 1) | (value & 1);
        if (context_data_position++ == bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        }
        value = value >> 1;
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
      delete context_dictionaryToCreate[context_w];
    } else {
      value = context_dictionary[context_w];
      for (let j = 0; j < context_numBits; j++) {
        context_data_val = (context_data_val << 1) | (value & 1);
        if (context_data_position++ == bitsPerChar - 1) {
          context_data_position = 0;
          context_data.push(getCharFromInt(context_data_val));
          context_data_val = 0;
        }
        value = value >> 1;
      }
    }
    context_enlargeIn--;
    if (context_enlargeIn == 0) {
      context_enlargeIn = Math.pow(2, context_numBits);
      context_numBits++;
    }
  }

  // Mark the end of the stream
  value = 2;
  for (let j = 0; j < context_numBits; j++) {
    context_data_val = (context_data_val << 1) | (value & 1);
    if (context_data_position++ == bitsPerChar - 1) {
      context_data_position = 0;
      context_data.push(getCharFromInt(context_data_val));
      context_data_val = 0;
    }
    value = value >> 1;
  }

  // Flush
  while (true) {
    context_data_val = (context_data_val << 1);
    if (context_data_position++ == bitsPerChar - 1) {
      context_data.push(getCharFromInt(context_data_val));
      break;
    }
  }
  return context_data.join("");
}

function _decompress(length, resetValue, getNextValue) {
  let dictionary = [0,1,2],
    enlargeIn = 4,
    dictSize = 4,
    numBits = 3,
    entry = "",
    result = [],
    i, w, bits, resb, maxpower, power,
    data = { val: getNextValue(0), position: resetValue, index: 1 };

  const readBits = (n) => {
    let bits = 0, maxpower = Math.pow(2, n), power = 1;
    while (power != maxpower) {
      const resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.val = getNextValue(data.index++);
        data.position = resetValue;
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }
    return bits;
  };

  let bitsVal = readBits(2);
  switch (bitsVal) {
    case 0:
      bits = readBits(8);
      w = String.fromCharCode(bits);
      break;
    case 1:
      bits = readBits(16);
      w = String.fromCharCode(bits);
      break;
    case 2:
      return "";
  }
  dictionary[3] = w;
  result.push(w);
  while (true) {
  if (data.index > length) return "";
  let cc = readBits(numBits);
    switch (cc) {
      case 0:
        bits = readBits(8);
        dictionary[dictSize++] = String.fromCharCode(bits);
        cc = dictSize - 1;
        enlargeIn--;
        break;
      case 1:
        bits = readBits(16);
        dictionary[dictSize++] = String.fromCharCode(bits);
        cc = dictSize - 1;
        enlargeIn--;
        break;
      case 2:
        return result.join("");
    }

    if (enlargeIn == 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }

    if (dictionary[cc]) {
      entry = dictionary[cc];
    } else {
      if (cc === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return null;
      }
    }
    result.push(entry);

    // Add w+entry[0] to the dictionary.
    dictionary[dictSize++] = w + entry.charAt(0);
    enlargeIn--;

    w = entry;
    if (enlargeIn == 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
  }
}

function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function maybeOptimizeDataUrl(dataUrl) {
  if (!isDataUrl(dataUrl)) return dataUrl;
  if (typeof document === "undefined") return dataUrl;

  try {
    const img = new Image();
    const loadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
    img.src = dataUrl;
    await loadPromise;

    const MAX_DIMENSION = 420;
    const MAX_PIXELS = MAX_DIMENSION * MAX_DIMENSION;
    const totalPixels = img.width * img.height;
    const scale = totalPixels > MAX_PIXELS
      ? Math.sqrt(MAX_PIXELS / totalPixels)
      : 1;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Prefer webp for better compression; fallback to png if unsupported.
    const outputType = canvas.toDataURL("image/webp", 0.82);
    if (outputType && outputType.length < dataUrl.length) {
      return outputType;
    }
    return dataUrl;
  } catch (error) {
    console.warn("Failed to optimise postcard image", error);
    return dataUrl;
  }
}

export function getShareBase() {
  const normalizedEnv = typeof SHARE_BASE_ENV === "string"
    ? SHARE_BASE_ENV.trim().replace(/\/+$/, "")
    : "";
  if (normalizedEnv) return normalizedEnv;

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin && !/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(origin)) {
      return origin.replace(/\/+$/, "");
    }
  }

  return DEFAULT_SHARE_BASE;
}

export function readShareTokenFromLocation() {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  let encoded = params.get(SHARE_PARAM);
  if (encoded) return encoded;

  const rawHash = window.location.hash.slice(1);
  if (!rawHash) return null;

  // Support both "share=..." and custom hash strings without key/value pairs
  if (rawHash.startsWith(`${SHARE_PARAM}=`)) {
    const candidate = rawHash.slice(SHARE_PARAM.length + 1);
    try {
      return decodeURIComponent(candidate);
    } catch {
      return candidate;
    }
  }

  const hashParams = new URLSearchParams(rawHash);
  const candidate = hashParams.get(SHARE_PARAM);
  if (!candidate) return null;
  try {
    return decodeURIComponent(candidate);
  } catch {
    return candidate;
  }
}

function normalizeStrings(input) {
  if (!input) return { ...FALLBACK_STRINGS };
  const result = { ...FALLBACK_STRINGS, ...input };
  const hasDesigns = Array.isArray(input.designs) && input.designs.length > 0;
  result.designs = hasDesigns ? input.designs : FALLBACK_STRINGS.designs;
  return result;
}

function GalacticPostcardStudio({ strings: rawStrings, langCode = DEFAULT_LANG }) {
  const strings = useMemo(() => normalizeStrings(rawStrings), [rawStrings]);
  const designs = useMemo(
    () =>
      strings.designs.map((design) => ({
        ...design,
        className: DESIGN_CLASS_MAP[design.id] ?? "design-generic",
      })),
    [strings.designs]
  );

  const firstDesign = designs[0]?.id ?? "aurora";
  const [selectedDesign, setSelectedDesign] = useState(firstDesign);

  useEffect(() => {
    if (!designs.some((design) => design.id === selectedDesign)) {
      setSelectedDesign(designs[0]?.id ?? "aurora");
    }
  }, [designs, selectedDesign]);

  const sampleMessage = strings.sampleMessage ?? FALLBACK_STRINGS.sampleMessage;
  const sampleSender = strings.sampleSender ?? FALLBACK_STRINGS.sampleSender;
  const previousSamplesRef = useRef({
    message: sampleMessage,
    sender: sampleSender,
  });

  const [message, setMessage] = useState(sampleMessage);
  const [sender, setSender] = useState(sampleSender);

  useEffect(() => {
    const { message: prevSampleMessage, sender: prevSampleSender } = previousSamplesRef.current;
    setMessage((current) => (current === prevSampleMessage ? sampleMessage : current));
    setSender((current) => (current === prevSampleSender ? sampleSender : current));
    previousSamplesRef.current = { message: sampleMessage, sender: sampleSender };
  }, [sampleMessage, sampleSender]);

  const [photo, setPhoto] = useState(null);
  const photoInputId = useId();
  const parsedShareRef = useRef(false);
  const copyTimeoutRef = useRef(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareState, setShareState] = useState("idle");
  const [shareError, setShareError] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [isShareView, setIsShareView] = useState(false);
  const shareSnapshotRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const baseDataUrl = await fileToDataUrl(file);
      const optimizedDataUrl = await maybeOptimizeDataUrl(baseDataUrl);
      setPhoto({ file, url: optimizedDataUrl, name: file.name, dataUrl: optimizedDataUrl });
    } catch (error) {
      console.error("Failed to read postcard image", error);
      setPhoto({ file, url: null, name: file.name, dataUrl: null });
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (parsedShareRef.current) return;
    const encoded = readShareTokenFromLocation();
    if (!encoded) return;
    const payload = decodePayload(encoded);
    if (!payload) return;
    parsedShareRef.current = true;
    if (payload.d && typeof payload.d === "string") {
      setSelectedDesign(payload.d);
    }
    if (typeof payload.m === "string") {
      setMessage(payload.m);
    }
    if (typeof payload.s === "string") {
      setSender(payload.s);
    }
    if (typeof payload.p === "string" && isDataUrl(payload.p)) {
      setPhoto({ file: null, url: payload.p, name: "shared-image", dataUrl: payload.p });
    }
    setIsShareView(true);
    const shareBase = getShareBase();
    const viewPath = langCode === DEFAULT_LANG ? "/verpostal" : `/verpostal?lang=${langCode}`;
    const renderedUrl = new URL(viewPath, `${shareBase}/`);
  // Avoid percent-encoding URL-safe compressed tokens (they use a safe alphabet).
  const encodedToken = typeof encoded === "string" && encoded.startsWith("c1:") ? encoded : encodeURIComponent(encoded);
  renderedUrl.hash = `${SHARE_PARAM}=${encodedToken}`;
    if (window.history && window.history.replaceState) {
      const title = typeof document !== "undefined" ? document.title : "";
      window.history.replaceState({}, title, renderedUrl.toString());
    }
    setShareUrl(renderedUrl.toString());
    setShareState("success");
    const snapshot = JSON.stringify({
      d: payload.d ?? firstDesign,
      m: payload.m ?? sampleMessage,
      s: payload.s ?? sampleSender,
      p: payload.p ?? null,
    });
    shareSnapshotRef.current = snapshot;
  }, [firstDesign, sampleMessage, sampleSender]);
 
  useEffect(() => {
    if (!shareSnapshotRef.current) return;
    if (shareState !== "success") return;
    const currentPhotoData = photo?.dataUrl && isDataUrl(photo.dataUrl)
      ? photo.dataUrl
      : photo?.url && isDataUrl(photo.url)
        ? photo.url
        : null;
    const snapshot = JSON.stringify({
      d: selectedDesign,
      m: message.trim() || sampleMessage,
      s: sender.trim() || sampleSender,
      p: currentPhotoData,
    });
    if (snapshot !== shareSnapshotRef.current) {
      setShareState("stale");
    }
  }, [selectedDesign, message, sender, photo?.dataUrl, photo?.url, sampleMessage, sampleSender, shareState]);

  const handleGenerateShareLink = async () => {
    if (typeof window === "undefined") return;
    setShareState("loading");
    setShareError(null);
    setCopyFeedback(null);

    try {
      // Determine photo data (data URL) if present
      let photoData = null;
      if (photo) {
        if (photo.dataUrl && isDataUrl(photo.dataUrl)) {
          photoData = photo.dataUrl;
        } else if (photo.file) {
          photoData = await fileToDataUrl(photo.file);
        } else if (photo.url && isDataUrl(photo.url)) {
          photoData = photo.url;
        }
      }

      // If PUBLIC_FIREBASE_DATABASE_URL or PUBLIC_FIREBASE_PROJECT_ID exists, try storing the base64 in Realtime DB
      let uploadedPhotoUrl = null;
      const env = typeof import.meta !== "undefined" ? import.meta.env : {};
      const firebaseDatabaseUrlEnv = env.PUBLIC_FIREBASE_DATABASE_URL;
      const firebaseProjectId = env.PUBLIC_FIREBASE_PROJECT_ID;
      const databaseURL = firebaseDatabaseUrlEnv
        ? String(firebaseDatabaseUrlEnv)
        : firebaseProjectId
          ? `https://${String(firebaseProjectId)}-default-rtdb.firebaseio.com`
          : null;

      if (photoData && databaseURL) {
        try {
          // Try writing the base64 into Realtime Database under /postalesTemp and set TTL for 2 days
          const expiresAt = Date.now() + 2 * 24 * 60 * 60 * 1000; // 2 days
          const endpoint = `${databaseURL.replace(/\/+$/, "")}/postalesTemp.json`;
          try {
            console.debug("Posting postcard to Realtime DB", endpoint);
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ p: photoData, expiresAt }),
            });
            const bodyText = await res.text();
            try {
              const jsonBody = JSON.parse(bodyText);
              console.debug("Realtime DB post response JSON:", jsonBody);
              if (jsonBody && jsonBody.name) {
                uploadedPhotoUrl = `db:${jsonBody.name}`;
              } else {
                console.warn("Realtime DB post returned no name key", jsonBody);
              }
            } catch (parseErr) {
              console.warn("Realtime DB response not JSON", bodyText);
            }
            if (!res.ok) {
              console.warn("Realtime DB returned non-ok status", res.status, res.statusText);
            }
          } catch (err) {
            console.warn("Realtime DB write failed", err);
          }
        } catch (err) {
          console.warn("Realtime DB write failed, falling back to inlined image", err);
          uploadedPhotoUrl = null;
        }
      }

      const payload = {
        d: selectedDesign,
        m: message.trim() || sampleMessage,
        s: sender.trim() || sampleSender,
      };
      if (uploadedPhotoUrl) {
        // store the public URL instead of the full data URL
        payload.p = uploadedPhotoUrl;
      } else if (photoData) {
        // No upload performed — keep the data URL (will be compressed if large)
        if (photoData.length > PHOTO_DATA_LIMIT) {
          const error = new Error("PHOTO_TOO_LARGE");
          error.code = "PHOTO_TOO_LARGE";
          throw error;
        }
        payload.p = photoData;
      }

      // If we tried to use Realtime DB but didn't get an uploadedPhotoUrl, show a helpful error
      if (!uploadedPhotoUrl && databaseURL && photoData) {
        setShareError("Failed to store image in Realtime DB. Check PUBLIC_FIREBASE_CONFIG and database rules (write allowed). Falling back to inlined image.");
      }

      const encoded = encodePayload(payload);
      if (!encoded) {
        throw new Error("ENCODE_FAILED");
      }

      const shareBase = getShareBase();
      const viewPath = langCode === DEFAULT_LANG ? "/verpostal" : `/verpostal?lang=${langCode}`;
      const url = new URL(viewPath, `${shareBase}/`);
  // Avoid percent-encoding URL-safe compressed tokens (they use a safe alphabet).
  const encodedToken = typeof encoded === "string" && encoded.startsWith("c1:") ? encoded : encodeURIComponent(encoded);
  url.hash = `${SHARE_PARAM}=${encodedToken}`;
      const shareLink = url.toString();
      setShareUrl(shareLink);
      setShareState("success");
      const snapshot = JSON.stringify({
        d: payload.d,
        m: payload.m,
        s: payload.s,
        p: payload.p ?? null,
      });
      shareSnapshotRef.current = snapshot;
    } catch (error) {
      console.error("Failed to generate share link", error);
      if (error?.code === "PHOTO_TOO_LARGE") {
        setShareError(strings.shareTooLarge ?? FALLBACK_STRINGS.shareTooLarge);
      } else {
        setShareError(strings.shareError);
      }
      setShareState("error");
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback("copied");
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopyFeedback(null);
      }, 2200);
    } catch (error) {
      console.error("Failed to copy share link", error);
      setCopyFeedback(null);
      setShareError(strings.shareError);
    }
  };

  const designClassName = DESIGN_CLASS_MAP[selectedDesign] ?? "design-generic";
  const canCopyLink = Boolean(
    shareUrl && (shareState === "success" || shareState === "stale")
  );

  if (isShareView) {
    // Minimal read-only view for recipients. Show only the postcard preview and a CTA to create their own.
    return (
      <section className="postcard-studio shared-view">
        <div className="shared-header">
          <h2>{strings.previewHeading}</h2>
          <p className="helper-text">{strings.sharePreview}</p>
        </div>
        <div className="shared-preview-wrapper">
          <div className={["postcard-preview", designClassName].join(" ")}
            role="img"
            aria-label={message || sampleMessage}
          >
            {photo ? (
              <img src={photo.url} alt="" className="postcard-photo" />
            ) : (
              <div className="photo-placeholder" aria-hidden="true">
                <span>★</span>
              </div>
            )}
            <div className="message-block">
              <p className="message-text">{message || sampleMessage}</p>
              <span className="sender-text">{sender || sampleSender}</span>
            </div>
          </div>
          <div className="shared-actions">
            <a href="/postal" className="upload-button">
              {strings.createButton ?? "Create your postcard"}
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="postcard-studio">
      <div className="studio-grid">
        <div className="studio-column">
          <header className="section-header">
            <h2>{strings.designHeading}</h2>
            <p>{strings.designDescription}</p>
          </header>
          <div className="design-grid" role="list">
            {designs.map((design) => {
              const isActive = design.id === selectedDesign;
              const optionClass = [
                "design-option",
                design.className,
                isActive ? "is-selected" : null,
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <button
                  key={design.id}
                  type="button"
                  role="listitem"
                  className={optionClass}
                  onClick={() => setSelectedDesign(design.id)}
                  aria-pressed={isActive}
                >
                  <span className="sketch" aria-hidden="true" />
                  <span className="design-name">{design.name}</span>
                  <span className="design-description">{design.description}</span>
                </button>
              );
            })}
          </div>

          <section className="form-section">
            <h3>{strings.messageHeading}</h3>
            <label className="field">
              <span className="field-label">{strings.messageLabel}</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={strings.messagePlaceholder}
                rows={4}
              />
            </label>
            <label className="field">
              <span className="field-label">{strings.senderLabel}</span>
              <input
                type="text"
                value={sender}
                onChange={(event) => setSender(event.target.value)}
                placeholder={strings.senderPlaceholder}
              />
            </label>
          </section>

          <section className="form-section">
            <h3>{strings.photoHeading}</h3>
            <p className="helper-text">{strings.photoHint}</p>
            <div className="upload-row">
              <label htmlFor={photoInputId} className="upload-button">
                {strings.photoButton}
              </label>
              <input
                id={photoInputId}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              {photo ? (
                <button type="button" className="ghost-button" onClick={removePhoto}>
                  {strings.photoRemove}
                </button>
              ) : null}
            </div>
            {photo ? (
              <p className="helper-text" aria-live="polite">
                {photo.name}
              </p>
            ) : null}
          </section>

          <section className="form-section share-section">
            <h3>{strings.shareHeading}</h3>
            <p className="helper-text">{strings.shareDescription}</p>
            {isShareView ? (
              <p className="share-notice" aria-live="polite">
                {strings.shareViewingNotice}
              </p>
            ) : null}
            {shareState === "stale" ? (
              <p className="share-notice" aria-live="polite">
                {strings.shareStale}
              </p>
            ) : null}
            <div className="share-actions">
              <button
                type="button"
                className="upload-button share-button"
                onClick={handleGenerateShareLink}
                disabled={shareState === "loading"}
              >
                {shareState === "loading" ? strings.shareGenerating : strings.shareButton}
              </button>
              {canCopyLink ? (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleCopyLink}
                  disabled={shareState === "stale"}
                >
                  {copyFeedback === "copied" ? strings.shareCopied : strings.shareCopy}
                </button>
              ) : null}
            </div>
            {shareError ? (
              <p className="helper-text error-text" role="status">
                {shareError}
              </p>
            ) : null}
            {canCopyLink ? (
              <div className="share-output">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  onFocus={(event) => event.target.select()}
                  aria-describedby="share-hint"
                />
                <p id="share-hint" className="helper-text">
                  {strings.sharePreview}
                </p>
              </div>
            ) : null}
          </section>
        </div>

        <div className="studio-column preview-column">
          <header className="section-header">
            <h2>{strings.previewHeading}</h2>
            <p>{strings.previewNote}</p>
          </header>
          <div className={["postcard-preview", designClassName].join(" ")}
            role="img"
            aria-label={message || sampleMessage}
          >
            {photo ? (
              <img src={photo.url} alt="" className="postcard-photo" />
            ) : (
              <div className="photo-placeholder" aria-hidden="true">
                <span>★</span>
              </div>
            )}
            <div className="message-block">
              <p className="message-text">{message || sampleMessage}</p>
              <span className="sender-text">{sender || sampleSender}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GalacticPostcardStudio;
