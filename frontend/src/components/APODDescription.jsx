import { useState } from "react";

const PREVIEW_LEN = 150;

export default function APODDescription({ text }) {
  const [expanded, setExpanded] = useState(false);
  const isLong   = text.length > PREVIEW_LEN;
  const preview  = isLong ? text.slice(0, PREVIEW_LEN).trimEnd() : text;
  const tail     = isLong ? text.slice(PREVIEW_LEN) : "";

  return (
    <div className="apod-desc">
      <p className="apod-desc-text">
        {preview}{isLong && !expanded && "…"}
      </p>

      {/* Smooth grid-row expand for the remaining text */}
      {isLong && (
        <div className={`apod-desc-extra ${expanded ? "apod-desc-extra--open" : ""}`}>
          <div className="apod-desc-extra-inner">
            <p>{tail}</p>
          </div>
        </div>
      )}

      {isLong && (
        <button
          className="apod-desc-toggle"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>
      )}
    </div>
  );
}
