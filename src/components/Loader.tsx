import React from "react";

interface LoaderProps {
  message?: string;
  variant?: "inline" | "overlay" | "fullscreen";
  compact?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Загрузка...", variant = "inline", compact = false }) => {
  const content = (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: compact ? 14 : 20,
          height: compact ? 14 : 20,
          border: "3px solid rgba(255,255,255,0.3)",
          borderTopColor: "#61dafb",
          borderRadius: "50%",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <span style={{ fontSize: compact ? 12 : 14 }}>{message}</span>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 9999,
        }}
      >
        {content}
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          zIndex: 100,
          pointerEvents: "none",
        }}
      >
        {content}
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // inline
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", padding: compact ? 0 : 24, minHeight: compact ? 0 : 200 }}>
      {content}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Loader;


