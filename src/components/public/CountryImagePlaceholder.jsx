import { useState } from "react";

/**
 * Reserves a correctly-sized image slot for a real asset that doesn't exist
 * yet, without ever requesting one from the web. Renders the <img> with the
 * real alt text and dimensions in place; if the file at `src` isn't there
 * (404), swap to a local gradient placeholder instead of a broken-image icon.
 */
const CountryImagePlaceholder = ({ src, alt, aspect = "aspect-[16/9]", note }) => {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative w-full ${aspect} rounded-[1.5rem] overflow-hidden border border-white/10 bg-slate-800/60`}>
      {!failed && (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-800 to-slate-900 text-center px-6">
          <i className="fas fa-image text-slate-600 text-3xl" aria-hidden="true" />
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">
            Image pending
          </p>
          {note && <p className="text-slate-600 text-[11px] max-w-xs leading-relaxed">{note}</p>}
        </div>
      )}
    </div>
  );
};

export default CountryImagePlaceholder;
