import React from "react";
import "quill/dist/quill.snow.css";
import { safeRichHtml } from "../../utils/safeHtml";

// The admin editor's toolbar only offers H2/H3 (see QuillEditor.jsx), but
// older posts and pasted-in content can still carry a literal <h1> - which
// would duplicate the page's own <h1> (the post title in BlogDetails.jsx).
// Demote any that make it into stored content rather than trusting the CMS
// record to be clean.
const demoteH1s = (html) =>
  (html || "").replace(/<h1(\s[^>]*)?>/gi, "<h2$1>").replace(/<\/h1>/gi, "</h2>");

// Shows saved editor content read-only. The HTML was written by the Quill
// editor, so Quill's own stylesheet and the same wrapper classes Quill uses
// in read-only mode display it identically - without downloading the editor
// itself (about 58 KB compressed) on every blog post.
const QuillViewer = ({ value = "" }) => (
  <div className="ql-viewer-root ql-container ql-snow ql-disabled">
    <div className="ql-editor" dangerouslySetInnerHTML={{ __html: safeRichHtml(demoteH1s(value)) }} />
  </div>
);

export default QuillViewer;
