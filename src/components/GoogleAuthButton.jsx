import { useEffect, useRef, useState } from "react";
import { auth, googleProvider } from "../lib/firebaseClient.js";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const GoogleIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.928 32.91 29.419 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.63 6.053 29.532 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.815C14.468 16.059 18.83 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.63 6.053 29.532 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.364 0 10.282-2.053 13.981-5.411l-6.462-5.466C29.329 35.318 26.793 36 24 36c-5.393 0-9.889-3.11-11.69-7.555l-6.57 5.06C8.06 39.593 15.45 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.147 3.41-3.583 6.08-6.784 7.123l6.462 5.466C38.508 37.574 44 31.5 44 24c0-1.341-.138-2.651-.389-3.917z" />
    </svg>
);

// Intenta normalizar URLs de foto de Google para usar un tamaño fijo
function normalizeGooglePhotoURL(url, size = 64) {
    try {
        // Casos comunes: .../s96-c/... o parámetro =s96-c
        // Reemplazamos cualquier "=sXX" o "=sXX-c" por uno controlado
        let out = url;
        // Elimina querystring para evitar duplicar parámetros
        out = out.split("?")[0];
        // Reemplaza tamaños comunes
        out = out.replace(/=s\d+-?c?$/i, "");
        // Si termina en "/photo.jpg" de Google, añadimos tamaño
        if (/googleusercontent\.com\/[^?]+$/i.test(out)) {
            out = `${out}=s${size}-c`;
        }
        return out;
    } catch {
        return url;
    }
}

export default function GoogleAuthButton() {
    const [user, setUser] = useState(null);
    const [busy, setBusy] = useState(false);
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const [avatarSrc, setAvatarSrc] = useState("/MixTechDevs.webp");

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    // Normaliza la URL del avatar de Google y agrega tamaño pequeño para reducir tráfico
    useEffect(() => {
        if (!user?.photoURL) {
            setAvatarSrc("/MixTechDevs.webp");
            return;
        }
        const normalized = normalizeGooglePhotoURL(user.photoURL, 64);
        setAvatarSrc(normalized);
    }, [user?.photoURL]);

    // Cerrar el menú al hacer clic fuera o al presionar Escape
    useEffect(() => {
        const onClick = (e) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const signIn = async () => {
        try {
            setBusy(true);
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Google sign-in failed", err);
            alert("No se pudo iniciar sesión con Google.");
        } finally {
            setBusy(false);
        }
    };

    const signOutUser = async () => {
        try {
            setBusy(true);
            await signOut(auth);
        } catch (err) {
            console.error("Sign out failed", err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="google-auth" style={{ display: "flex", alignItems: "center" }} ref={menuRef}>
            {user ? (
                <div style={{ position: "relative" }}>
                    <button
                        onClick={() => setOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={open ? "true" : "false"}
                        title={user.displayName || "Cuenta"}
                        style={avatarButtonStyle}
                    >
                        <img
                            src={avatarSrc}
                            alt={user.displayName || "Usuario"}
                            width={28}
                            height={28}
                            style={{ borderRadius: "50%", display: "block" }}
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                if (e.currentTarget.src.endsWith("MixTechDevs.webp")) return; // evita bucle
                                setAvatarSrc("/MixTechDevs.webp");
                            }}
                        />
                        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true" style={{ opacity: 0.8 }}>
                            <path fill="currentColor" d="M7 10l5 5 5-5z" />
                        </svg>
                    </button>
                    {open && (
                        <div role="menu" aria-label="Menú de usuario" style={menuStyle}>
                            <div style={menuHeaderStyle}>
                                <img
                                    src={avatarSrc}
                                    alt="avatar"
                                    width={28}
                                    height={28}
                                    style={{ borderRadius: "50%" }}
                                    loading="lazy"
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                />
                                <div style={{ lineHeight: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{user.displayName || "Usuario"}</div>
                                    <div style={{ opacity: 0.8, fontSize: 12 }}>{user.email}</div>
                                </div>
                            </div>
                            <button
                                role="menuitem"
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    setOpen(false);
                                    await signOutUser();
                                }}
                                style={menuItemStyle}
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    className="google-btn"
                    onClick={signIn}
                    disabled={busy}
                    aria-label="Iniciar sesión con Google"
                    title="Iniciar sesión con Google"
                    style={buttonStyle}
                >
                    <GoogleIcon />
                    <span style={{ marginLeft: 6 }}>Google</span>
                </button>
            )}
        </div>
    );
}

const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.5rem 0.85rem",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.15)",
    color: "#e6eaff",
    cursor: "pointer",
    fontWeight: 600,
};

const avatarButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "0.25rem 0.45rem",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.15)",
    color: "#e6eaff",
    cursor: "pointer",
};

const menuStyle = {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    minWidth: 200,
    padding: 8,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(10,16,34,0.92)",
    boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
    zIndex: 1000,
    backdropFilter: "blur(10px) saturate(130%)",
    WebkitBackdropFilter: "blur(10px) saturate(130%)",
};

const menuHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 8px 10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 6,
};

const menuItemStyle = {
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#e6eaff",
    cursor: "pointer",
};
