import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { auth, db } from "../lib/firebaseClient.js";

export default function ReminderAssistant({ translations, initialLang }) {
    const [count, setCount] = useState(0);
    const strings = (translations && translations.reminders) || {};

    useEffect(() => {
        let unsubscribeReminders = null;
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            if (!user) {
                setCount(0);
                return;
            }
            const remindersRef = ref(db, `users/${user.uid}/reminders`);
            unsubscribeReminders = onValue(remindersRef, (snapshot) => {
                const raw = snapshot.val();
                const list = raw ? Object.keys(raw) : [];
                setCount(list.length);
            }, () => setCount(0));
        });

        return () => {
            unsubAuth && unsubAuth();
            // onValue returns the callback; to stop listening we call off by passing null via ref
            // But the API returns an unsubscribe function when used as returned value from onValue in newer SDKs;
            // in browser we'll rely on the listener handle being cleaned up by the ref callback if present.
            // If we have a function, call it.
            if (typeof unsubscribeReminders === "function") unsubscribeReminders();
        };
    }, []);

    if (!count) return null;

    const getRemindersPath = (lang) => {
        if (!lang) {
            if (typeof navigator !== "undefined") {
                lang = navigator.language?.split("-")[0] ?? "es";
            } else {
                lang = "es";
            }
        }
        if (lang.startsWith("en")) return "/reminder";
        if (lang.startsWith("de")) return "/erinnerung";
        return "/recordatorio"; // default: Spanish
    };

    const navigateToReminders = () => {
        const path = getRemindersPath(initialLang);

        // Try a client-side fetch + swap of the main content to avoid full reload.
        // This is a progressive enhancement: if it fails, fallback to a normal navigation.
        try {
            fetch(path, { credentials: "same-origin" })
                .then((res) => {
                    if (!res.ok) throw new Error("Network response not ok");
                    return res.text();
                })
                .then((html) => {
                    // Parse HTML and extract the main container content
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const newMain = doc.querySelector("main.container");
                    const currentMain = document.querySelector("main.container");
                    if (newMain && currentMain) {
                        currentMain.innerHTML = newMain.innerHTML;
                        // Update the URL without reloading
                        window.history.pushState({}, "", path);
                        // Scroll to top of new content
                        window.scrollTo(0, 0);
                    } else {
                        // Can't swap: fallback
                        window.location.href = path;
                    }
                })
                .catch(() => {
                    window.location.href = path;
                });
        } catch (err) {
            window.location.href = path;
        }
    };

    const assistantText =
        count === 1
            ? strings.assistantHintOne ?? strings.assistantHint?.replace("{count}", "1") ?? `Tienes 1 recordatorio.`
            : (strings.assistantHint ?? `Tienes {count} recordatorios.`).replace("{count}", String(count));

    return (
        <div
            className="global-reminder-assistant"
            role="button"
            tabIndex={0}
            aria-label={assistantText}
            onClick={navigateToReminders}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToReminders();
                }
            }}
        >
            <img src="/Aster.webp" alt="" width={40} height={40} />
            <span>{assistantText}</span>
            <style>{`
                .global-reminder-assistant {
                    position: fixed;
                    right: clamp(0.75rem, 3.5vw, 1.25rem);
                    bottom: clamp(8rem, 3.5vw, -1.25rem);
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.45rem 0.65rem;
                    border-radius: 999px;
                    border: 1px solid rgba(255,255,255,0.12);
                    background: rgba(10,16,34,0.9);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.36);
                    z-index: 2600;
                    cursor: pointer;
                }
                .global-reminder-assistant:focus {
                    outline: 3px solid rgba(137,180,255,0.35);
                    outline-offset: 4px;
                    font-size: 0.86rem;
                    color: var(--text);
                }
                .global-reminder-assistant img {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    object-fit: cover;
                    flex: 0 0 36px;
                }
                .global-reminder-assistant span {
                    max-width: 180px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: inline-block;
                }
                @media (max-width: 600px) {
                    .global-reminder-assistant {
                        left: 0;
                        right: 0;
                        bottom: 0.9rem;
                        width: min(92vw, 320px);
                        margin: 0 auto;
                        justify-content: center;
                    }
                    .global-reminder-assistant img { display: none; }
                }
            `}</style>
        </div>
    );
}
