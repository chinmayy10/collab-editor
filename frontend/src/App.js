import React, { useState } from "react";
import Editor from "./components/Editor";

function App() {
  const [docId, setDocId] = useState("");
  const [openId, setOpenId] = useState(null);

  const openDoc = () => {
    if (!docId) return alert("Enter a document id");
    setOpenId(docId);
  };

  return (
    <div>
      {!openId ? (
        <div style={{ padding: 20 }}>
          <h2>Open Document</h2>
          <input
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            placeholder="Enter document id"
            style={{ padding: 8, width: 320 }}
          />
          <button onClick={openDoc} style={{ marginLeft: 8, padding: "8px 12px" }}>
            Open
          </button>
        </div>
      ) : (
        <Editor docId={openId} />
      )}
    </div>
  );
}

export default App;
