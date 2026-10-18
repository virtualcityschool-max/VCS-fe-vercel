import React, { Suspense } from "react";

// The real component pulls in a large library; load it only when it is shown,
// so it isn't part of every page's download (home page speed).
const Content = React.lazy(() => import("./QuillEditorContent"));

const QuillEditor = (props) => (
  <Suspense fallback={null}>
    <Content {...props} />
  </Suspense>
);

export default QuillEditor;
