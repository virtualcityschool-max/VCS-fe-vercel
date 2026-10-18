import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// The admin editor's toolbar only offers H2/H3 (see QuillEditor.jsx), but
// older posts and pasted-in content can still carry a literal <h1> - which
// would duplicate the page's own <h1> (the post title in BlogDetails.jsx).
// Demote any that make it into stored content rather than trusting the CMS
// record to be clean.
const demoteH1s = (html) =>
  (html || "").replace(/<h1(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>");

const QuillViewer = ({ value = "" }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      readOnly: true,
      modules: { toolbar: false },
    });

    quill.root.innerHTML = demoteH1s(value);
    quillRef.current = quill;
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;
    quillRef.current.root.innerHTML = demoteH1s(value);
  }, [value]);

  return <div className="ql-viewer-root" ref={containerRef} />;
};

export default QuillViewer;
