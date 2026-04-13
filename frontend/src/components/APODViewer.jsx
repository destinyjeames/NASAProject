export default function APODViewer({ apod }) {
  if (apod.media_type === "video") {
    return (
      <div className="apod-media apod-media--video">
        <iframe
          src={apod.url}
          title={apod.title}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    );
  }

  return (
    <div className="apod-media apod-media--image">
      <img src={apod.url} alt={apod.title} />
      <div className="apod-media-overlay" />
    </div>
  );
}
