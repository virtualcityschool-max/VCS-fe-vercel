import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

const QuillEditor = ({ value = "", onChange, placeholder = "Write something..." }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      placeholder,
      modules: {
        toolbar: {
          container: TOOLBAR,
          handlers: {
            // Quill's default "clean" (Tx) only clears formatting when text is
            // selected, so it looks like a no-op on a collapsed cursor. Clear
            // the current line's formatting in that case, and the whole doc
            // when the editor isn't focused.
            clean() {
              const q = this.quill;
              const range = q.getSelection();
              if (!range) {
                q.removeFormat(0, q.getLength(), Quill.sources.USER);
                return;
              }
              if (range.length === 0) {
                const [line] = q.getLine(range.index);
                if (line) {
                  const start = q.getIndex(line);
                  q.removeFormat(start, line.length(), Quill.sources.USER);
                }
              } else {
                q.removeFormat(range.index, range.length, Quill.sources.USER);
              }
            },
          },
        },
      },
    });

    quill.root.innerHTML = value || "";

    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChangeRef.current(html === "<p><br></p>" ? "" : html);
    });

    quillRef.current = quill;
  }, []);

  // Sync external value changes (e.g. form reset)
  useEffect(() => {
    if (!quillRef.current) return;
    const current = quillRef.current.root.innerHTML;
    const normalized = current === "<p><br></p>" ? "" : current;
    if ((value || "") !== normalized) {
      quillRef.current.root.innerHTML = value || "";
    }
  }, [value]);

  return <div ref={containerRef} />;
};

export default QuillEditor;
