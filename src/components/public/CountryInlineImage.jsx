/**
 * Wikipedia-style inline image: floats beside the paragraph it illustrates
 * instead of sitting in a hero block or gallery. Always below the fold (used
 * inside body sections, never in the header), so always lazy-loaded.
 * Explicit width/height (the image's real intrinsic size) reserve the aspect
 * ratio to avoid layout shift while CSS controls the actual rendered size.
 */
const CountryInlineImage = ({ image, countrySlug, side = "right" }) => {
  const floatClass = side === "right" ? "sm:float-right sm:ml-6" : "sm:float-left sm:mr-6";
  return (
    <figure className={`w-full sm:w-[42%] ${floatClass} mb-4`}>
      <img
        src={`/assets/countries/${countrySlug}/${image.src}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        className="w-full h-auto rounded-xl border border-white/10 object-cover"
      />
      {image.caption && (
        <figcaption className="mt-2 text-xs text-slate-500 leading-snug">{image.caption}</figcaption>
      )}
    </figure>
  );
};

export default CountryInlineImage;
