// In components/forms/RichTextEditor.tsx
"use client";

import React, { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const formatText = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="border rounded overflow-hidden">
      <div className="bg-gray-100 p-2 border-b flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => formatText("bold")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => formatText("italic")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => formatText("underline")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Underline"
        >
          <u>U</u>
        </button>
        <div className="border-r mx-1 h-6"></div>
        <button
          type="button"
          onClick={() => formatText("formatBlock", "<h2>")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => formatText("formatBlock", "<h3>")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Subheading"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => formatText("formatBlock", "<p>")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Paragraph"
        >
          P
        </button>
        <div className="border-r mx-1 h-6"></div>
        <button
          type="button"
          onClick={() => formatText("insertUnorderedList")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => formatText("insertOrderedList")}
          className="p-1 hover:bg-gray-200 rounded"
          title="Numbered List"
        >
          1. List
        </button>
        <div className="border-r mx-1 h-6"></div>
        <button
          type="button"
          onClick={() => {
            const url = prompt("Enter link URL:");
            if (url) formatText("createLink", url);
          }}
          className="p-1 hover:bg-gray-200 rounded"
          title="Insert Link"
        >
          Link
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[300px] outline-none"
        onInput={handleInput}
        placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value }}
      ></div>
    </div>
  );
};

export default RichTextEditor;
