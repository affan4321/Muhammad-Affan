"use client";

import { useState } from "react";

type Props = {
  pdfUrl: string;
};

export const PDFViewer = ({ pdfUrl }: Props) => {
  return (
    <div
      style={{
        width: "100%",
        height: "500px",
        backgroundColor: "#1a1a1a",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #333",
      }}
    >
      <iframe
        src={pdfUrl}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="PDF Viewer"
      />
    </div>
  );
};

export default PDFViewer;
