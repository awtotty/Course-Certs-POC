import React, { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "react-resizable/css/styles.css";
import { ResizableBox } from "react-resizable";

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
  const [draggingElement, setDraggingElement] = useState<string | null>(null);
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

  const handleMouseDown = (id: string, e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDraggingElement(id);
    setSelectedElementId(id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setElements((prev) =>
        prev.map((el) => (el.id === draggingElement ? { ...el, x, y } : el))
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingElement(null);
  };

  const handleResize = (id: string, width: number, height: number) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, width, height } : el))
    );
  };

  const exportToPDF = async () => {
    if (canvasRef.current) {
      const canvas = await html2canvas(canvasRef.current);

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvasWidth, canvasHeight],
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, canvasWidth, canvasHeight);

      pdf.save("custom_design.pdf");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333",
        lineHeight: "1.5",
        padding: "20px",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>Custom PDF Creator</h1>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={addTextElement}
          style={{
            backgroundColor: "slateblue",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Text
        </button>
        <label
          style={{
            backgroundColor: "slateblue",
            color: "#fff",
            padding: "10px 15px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Upload Image
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                addImageElement(e.target.files[0]);
              }
            }}
          />
        </label>
        <button
          onClick={exportToPDF}
          style={{
            backgroundColor: "gray",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Preview PDF
        </button>
      </div>
      <div
        ref={canvasRef}
        onMouseDown={() => setSelectedElementId(null)}
        style={{
          width: "800px",
          height: "600px",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
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
                onMouseDown={(e) => handleMouseDown(el.id, e)}
                suppressContentEditableWarning
                style={{
                  fontSize: el.fontSize,
                  color: el.fontColor,
                  fontFamily: el.fontFamily,
                  padding: "2px",
                  backgroundColor: "#ffffff",
                  borderRadius: "4px",
                  border: selectedElementId === el.id ? "1px solid #4CAF50" : "none",
                }}
                onBlur={(e) =>
                  updateTextElement(el.id, { content: e.currentTarget.innerText })
                }
              >
                {el.content}
              </div>
            ) : (
              <ResizableBox
                width={el.width}
                height={el.height}
                resizeHandles={["se"]}
                onResizeStop={(e, data) =>
                  handleResize(el.id, data.size.width, data.size.height)
                }
              >
                <img
                  src={el.content}
                  alt="User Element"
                  onMouseDown={(e) => handleMouseDown(el.id, e)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </ResizableBox>
            )}
          </div>
        ))}
      </div>
      {selectedElementId && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f1f1f1",
            borderRadius: "8px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => deleteElement(selectedElementId)}
            style={{
              backgroundColor: "#e91e63",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
          <button
            onClick={() =>
              updateTextElement(selectedElementId, {
                fontSize: (elements.find((el) => el.id === selectedElementId)?.fontSize || 16) + 2,
              })
            }
            style={{
              backgroundColor: "gray",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
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
            style={{
              backgroundColor: "gray",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Decrease Font Size
          </button>
          <input
            type="color"
            onChange={(e) =>
              updateTextElement(selectedElementId, { fontColor: e.target.value })
            }
            value={elements.find((el) => el.id === selectedElementId)?.fontColor || "#000000"}
            style={{
              width: "40px",
              height: "40px",
              border: "none",
              cursor: "pointer",
            }}
          />
          <select
            onChange={(e) =>
              updateTextElement(selectedElementId, { fontFamily: e.target.value })
            }
            value={elements.find((el) => el.id === selectedElementId)?.fontFamily || "Arial"}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
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

