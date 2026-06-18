import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

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

    quill.root.innerHTML = value || "";
    quillRef.current = quill;
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;
    quillRef.current.root.innerHTML = value || "";
  }, [value]);

  return <div className="ql-viewer-root" ref={containerRef} />;
};

export default QuillViewer;
