import { useEffect, useMemo, useRef, useState, useId } from "react";
import "../assets/css/GalacticPostcardStudio.css";

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

const DESIGN_CLASS_MAP = {
  aurora: "design-aurora",
  supernova: "design-supernova",
  orbit: "design-orbit",
  nebula: "design-nebula",
  signal: "design-signal",
  station: "design-station",
};

const SHARE_PARAM = "share";
const PHOTO_DATA_LIMIT = 350000; // ~350 KB in base64 to keep URLs reasonable
const DEFAULT_SHARE_BASE = "https://nasa-mixtechdevs.vercel.app";
const SHARE_BASE_ENV = import.meta.env.PUBLIC_SHARE_BASE_URL;

function encodePayload(payload) {
  try {
    const json = JSON.stringify(payload);
    const utf8 = new TextEncoder().encode(json);
    let binary = "";
    utf8.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  } catch (error) {
    console.error("Failed to encode postcard payload", error);
    return null;
  }
}

function decodePayload(value) {
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to decode postcard payload", error);
    return null;
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

function getShareBase() {
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

function readShareTokenFromLocation() {
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

function GalacticPostcardStudio({ strings: rawStrings }) {
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
    const renderedUrl = new URL(window.location.href);
    renderedUrl.searchParams.delete(SHARE_PARAM);
    const encodedToken = encodeURIComponent(encoded);
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

      if (photoData && photoData.length > PHOTO_DATA_LIMIT) {
        const error = new Error("PHOTO_TOO_LARGE");
        error.code = "PHOTO_TOO_LARGE";
        throw error;
      }

      const payload = {
        d: selectedDesign,
        m: message.trim() || sampleMessage,
        s: sender.trim() || sampleSender,
      };
      if (photoData) {
        payload.p = photoData;
      }

      const encoded = encodePayload(payload);
      if (!encoded) {
        throw new Error("ENCODE_FAILED");
      }

      const shareBase = getShareBase();
      const currentPath = typeof window !== "undefined" ? window.location.pathname || "/postal" : "/postal";
      const currentSearch = typeof window !== "undefined" ? window.location.search : "";
      const url = new URL(currentPath, `${shareBase}/`);
      const params = new URLSearchParams(currentSearch);
      params.delete(SHARE_PARAM);
      url.search = params.size ? `?${params.toString()}` : "";
      const encodedToken = encodeURIComponent(encoded);
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
