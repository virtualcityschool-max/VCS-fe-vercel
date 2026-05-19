import React, { useState } from "react";

const StarRating = ({ value = 0, onChange, readonly = false, size = "text-2xl" }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`${size} transition-all duration-100 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} ${
              filled ? "text-amber-400" : "text-slate-700"
            }`}
          >
            <i className={`fas fa-star`} />
          </button>
        );
      })}
      {value > 0 && (
        <span className="ml-2 text-sm font-semibold text-amber-400">{value}/5</span>
      )}
    </div>
  );
};

export default StarRating;
