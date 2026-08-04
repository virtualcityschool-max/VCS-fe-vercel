import React, { useState } from "react";
import { youTubeEmbedUrl, youTubeThumbnail } from "../../utils/youtube";

/**
 * YouTube player using the "facade" pattern: until the viewer presses play we
 * render only the poster image and a play button, so a listing page with many
 * video posts stays fast (no YouTube iframes/scripts loaded up front). The
 * iframe is mounted — with autoplay — on the first click.
 *
 * Props:
 *   videoId   – 11-char YouTube id (nothing renders without it)
 *   poster    – optional image URL; defaults to the YouTube thumbnail
 *   title     – accessible label for the player
 *   autoPlay  – mount the iframe immediately (detail page hero)
 *   rounded   – tailwind radius class for the frame
 *   className – extra classes on the 16:9 wrapper
 */
const VideoEmbed = ({
  videoId,
  poster,
  title = "Video",
  autoPlay = false,
  rounded = "rounded-2xl",
  className = "",
  onPlay,
}) => {
  const [playing, setPlaying] = useState(autoPlay);
  const [posterFailed, setPosterFailed] = useState(false);

  if (!videoId) return null;

  const posterSrc = !posterFailed ? poster || youTubeThumbnail(videoId) : null;

  const startPlaying = (e) => {
    // Cards wrap this in a <Link> — never navigate when play is pressed.
    e.preventDefault();
    e.stopPropagation();
    setPlaying(true);
    onPlay?.();
  };

  return (
    <div
      className={`relative w-full aspect-video overflow-hidden bg-slate-950 ${rounded} ${className}`}
    >
      {playing ? (
        <iframe
          src={youTubeEmbedUrl(videoId, { autoplay: !autoPlay })}
          title={title}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={startPlaying}
          aria-label={`Play video: ${title}`}
          className="group/play absolute inset-0 w-full h-full flex items-center justify-center"
        >
          {posterSrc ? (
            <img
              src={posterSrc}
              alt=""
              loading="lazy"
              onError={() => setPosterFailed(true)}
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover/play:opacity-100 group-hover/play:scale-105 transition duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
          )}

          {/* Scrim keeps the play button readable on bright thumbnails */}
          <span className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          <span className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600/90 group-hover/play:bg-red-500 shadow-[0_8px_30px_rgba(220,38,38,0.45)] group-hover/play:scale-110 transition duration-300">
            <i className="fas fa-play text-white text-lg sm:text-xl ml-1" />
          </span>
        </button>
      )}
    </div>
  );
};

export default VideoEmbed;
