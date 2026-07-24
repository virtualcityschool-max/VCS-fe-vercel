import React, { useEffect, useRef, useState } from "react";

/**
 * Reveal - animates children into view when they enter the viewport.
 * Pure presentation: renders a single wrapper element (default <div>)
 * with the `.reveal` CSS transition classes from index.css.
 *
 * Props:
 *  - as:        wrapper element/tag (default "div")
 *  - delay:     transition-delay in ms (for manual stagger)
 *  - className: extra classes on the wrapper
 */
const Reveal = ({ as = "div", delay = 0, className = "", children, ...props }) => {
  const Tag = as;
  const ref = useRef(null);
  // If IntersectionObserver is unavailable, render visible from the start
  const [visible, setVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
