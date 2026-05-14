import React from "react";
import { createPortal } from "react-dom";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

const FILE_ICON = {
  pdf:  "fa-file-pdf",
  doc:  "fa-file-word",
  docx: "fa-file-word",
  txt:  "fa-file-lines",
  png:  "fa-file-image",
  jpg:  "fa-file-image",
  jpeg: "fa-file-image",
  zip:  "fa-file-zipper",
};

const parseFileInfo = (fileUrl) => {
  try {
    const pathname = new URL(fileUrl).pathname;
    const filename = decodeURIComponent(pathname.split("/").pop()?.split("?")[0] || "attachment");
    const dot = filename.lastIndexOf(".");
    const ext = dot !== -1 ? filename.slice(dot + 1).toLowerCase() : "";
    return { filename, ext };
  } catch {
    const raw = fileUrl?.split("/")?.pop()?.split("?")[0] || "attachment";
    const dot = raw.lastIndexOf(".");
    return { filename: raw, ext: dot !== -1 ? raw.slice(dot + 1).toLowerCase() : "" };
  }
};

const triggerDownload = async (url, filename) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    // Force octet-stream so the browser never tries to open the file inline
    const downloadBlob = new Blob([blob], { type: "application/octet-stream" });
    const objectUrl = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Delay revocation — revoking synchronously races the browser's download start
    setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
  } catch {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download'; // Sets the default name for the file
    link.target = '_blank'; // Opens in a new tab if the browser can't trigger immediate download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // window.open(url, "_blank");
  }
};

// ── Sub-viewers ───────────────────────────────────────────────────────────────

const ImageViewer = ({ url, filename }) => (
  <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/60">
    <img
      src={url}
      alt={filename}
      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
    />
  </div>
);

const PdfViewer = ({ url }) => (
  <iframe
    src={url}
    title="PDF Preview"
    className="absolute inset-0 w-full h-full border-0"
  />
);


const WordViewer = ({ url, filename, ext }) => (
  <div className="absolute inset-0 overflow-auto">
    <DocViewer
      documents={[{ uri: url, fileName: filename, fileType: ext }]}
      pluginRenderers={DocViewerRenderers}
      style={{ width: "100%", height: "100%", minHeight: "100%", background: "transparent" }}
      config={{ header: { disableHeader: true } }}
    />
  </div>
);

const DownloadOnly = ({ url, filename, iconClass, reason }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-slate-950/40">
    <div className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-10 flex flex-col items-center max-w-sm w-full shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 shadow-inner relative group">
        <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all rounded-3xl" />
        <i className={`fas ${iconClass} text-indigo-400 text-3xl relative z-10`} />
      </div>
      
      <div className="text-center mb-8">
        <h3 className="text-white font-black text-xl mb-2 tracking-tight">No Preview Available</h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed">
          {reason} <br />
          <span className="text-slate-500 text-xs mt-1 block italic font-normal">Please download the file to view its contents.</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => triggerDownload(url, filename)}
        className="w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98]"
      >
        <i className="fas fa-download text-xs" />
        Download File
      </button>
    </div>
  </div>
);
// ── Main component ────────────────────────────────────────────────────────────

const FileViewerModal = ({ filePath, handleClose }) => {
  if (!filePath) return null;

  const { filename, ext } = parseFileInfo(filePath);
  const iconClass = FILE_ICON[ext] || "fa-file";

  const renderBody = () => {
    if (["png", "jpg", "jpeg"].includes(ext))
      return <ImageViewer url={filePath} filename={filename} />;
    if (ext === "pdf")
      return <PdfViewer url={filePath} />;
    if (ext === "doc" || ext === "docx")
      return <WordViewer url={filePath} filename={filename} ext={ext} />;
    if (ext === "zip")
      return <DownloadOnly url={filePath} filename={filename} iconClass={iconClass} reason="ZIP files cannot be previewed." />;
    if (ext === "txt")
      return <DownloadOnly url={filePath} filename={filename} iconClass={iconClass} reason="Text files cannot be previewed inline." />;
    return <DownloadOnly url={filePath} filename={filename} iconClass={iconClass} reason="This file type cannot be previewed." />;
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={handleClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300"
        style={{ height: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0 rounded-t-3xl bg-slate-900/50 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
              <i className={`fas ${iconClass} text-indigo-400 text-sm`} />
            </div>
            <span className="text-white text-sm font-bold truncate max-w-md" title={filename}>
              {filename}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => triggerDownload(filePath, filename)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-500/20"
            >
              <i className="fas fa-download text-[10px]" />
              Download
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 transition-all border border-slate-700 hover:border-rose-500/30"
            >
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        </div>

        {/* Body — relative so sub-viewers can use absolute inset-0 */}
        <div className="flex-1 min-h-0 relative overflow-hidden rounded-b-3xl bg-slate-950/50">
          {renderBody()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FileViewerModal;
