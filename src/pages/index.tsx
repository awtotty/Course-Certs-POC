import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const Home = () => {
  const [elements, setElements] = useState<
    {
      id: string;
      type: "text" | "image";
      content: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize?: number;
      fontColor?: string;
      fontFamily?: string;
    }[]
  >([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addTextElement = () => {
    const id = Date.now().toString();
    setElements((prev) => [
      ...prev,
      {
        id,
        type: "text",
        content: "New Text",
        x: 50,
        y: 50,
        width: 150,
        height: 50,
        fontSize: 16,
        fontColor: "#000000",
        fontFamily: "Arial",
      },
    ]);
  };

  const addImageElement = (file: File) => {
    const id = Date.now().toString();
    const reader = new FileReader();
    reader.onload = () => {
      setElements((prev) => [
        ...prev,
        { id, type: "image", content: reader.result as string, x: 50, y: 50, width: 100, height: 100 },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    setSelectedElementId(null);
  };

  const updateTextElement = (id: string, updates: Partial<typeof elements[0]>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const handleDrag = (id: string, e: React.DragEvent<HTMLDivElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, x, y } : el))
      );
    }
  };

  const exportToPDF = async () => {
    if (canvasRef.current) {
      const canvas = await html2canvas(canvasRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "px", [canvas.width, canvas.height]);
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("custom_design.pdf");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Custom PDF Creator</h1>
      <button onClick={addTextElement}>Add Text</button>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            addImageElement(e.target.files[0]);
          }
        }}
      />
      <button onClick={exportToPDF}>Save as PDF</button>
      <div
        ref={canvasRef}
        style={{
          width: "800px",
          height: "600px",
          border: "1px solid #000",
          marginTop: "20px",
          position: "relative",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {elements.map((el) => (
          <div
            draggable
            key={el.id}
            onClick={() => setSelectedElementId(el.id)}
            onDragEnd={(e) => handleDrag(el.id, e)}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              cursor: "move",
            }}
          >
            {el.type === "text" ? (
              <div
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontSize: el.fontSize,
                  color: el.fontColor,
                  fontFamily: el.fontFamily,
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  wordWrap: "break-word",
                  textAlign: "center",
                  border: selectedElementId === el.id ? "1px solid #ccc" : "none",
                }}
                onBlur={(e) =>
                  updateTextElement(el.id, { content: e.currentTarget.innerText })
                }
              >
                {el.content}
              </div>
            ) : (
              <img
                src={el.content}
                alt="User Element"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
          </div>
        ))}
      </div>
      {selectedElementId && (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button onClick={() => deleteElement(selectedElementId)}>Delete</button>
          <button
            onClick={() =>
              updateTextElement(selectedElementId, {
                fontSize: (elements.find((el) => el.id === selectedElementId)?.fontSize || 16) + 2,
              })
            }
          >
            Increase Font Size
          </button>
          <button
            onClick={() =>
              updateTextElement(selectedElementId, {
                fontSize: Math.max(
                  (elements.find((el) => el.id === selectedElementId)?.fontSize || 16) - 2,
                  8
                ),
              })
            }
          >
            Decrease Font Size
          </button>
          <input
            type="color"
            onChange={(e) =>
              updateTextElement(selectedElementId, { fontColor: e.target.value })
            }
            value={elements.find((el) => el.id === selectedElementId)?.fontColor || "#000000"}
          />
          <select
            onChange={(e) =>
              updateTextElement(selectedElementId, { fontFamily: e.target.value })
            }
            value={elements.find((el) => el.id === selectedElementId)?.fontFamily || "Arial"}
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Home;

