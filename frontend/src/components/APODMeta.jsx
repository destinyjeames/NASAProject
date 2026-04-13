export default function APODMeta({ apod }) {
  const isVideo = apod.media_type === "video";

  return (
    <div className="apod-meta">
      <h1 className="apod-meta-title">{apod.title}</h1>
      <div className="apod-meta-chips">
        <span className="apod-chip">📅 {apod.date}</span>
        {apod.copyright && (
          <span className="apod-chip">© {apod.copyright.trim().replace(/\n/g, " ")}</span>
        )}
        <span className={`apod-chip apod-chip--${apod.media_type}`}>
          {isVideo ? "🎬 Video" : "🖼 Image"}
        </span>
      </div>
    </div>
  );
}
