import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { io } from "socket.io-client";

const SAVE_INTERVAL_MS = 2000;

export default function Editor({ docId }) {
  const socketRef = useRef(null);
  const quillRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const s = io("http://localhost:5000");
    socketRef.current = s;
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socketRef.current || !docId) return;
    const socket = socketRef.current;

    socket.emit("get-document", docId);

    socket.on("load-document", (data) => {
      const editor = quillRef.current.getEditor();
      editor.setContents(data);
      editor.enable();
      setIsLoaded(true);
    });

    return () => {
      socket.off("load-document");
    };
  }, [docId]);

  useEffect(() => {
    if (!socketRef.current || !quillRef.current || !isLoaded) return;
    const socket = socketRef.current;
    const editor = quillRef.current.getEditor();

    const handleReceiveChanges = (delta) => {
      editor.updateContents(delta);
    };
    socket.on("receive-changes", handleReceiveChanges);

    const handleTextChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    editor.on("text-change", handleTextChange);

    const interval = setInterval(() => {
      socket.emit("save-document", editor.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      socket.off("receive-changes", handleReceiveChanges);
      editor.off("text-change", handleTextChange);
      clearInterval(interval);
    };
  }, [isLoaded]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 8, background: "#f3f3f3" }}>
        <strong>Document:</strong> {docId}
      </div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        placeholder="Loading..."
        style={{ flex: 1 }}
      />
    </div>
  );
}
