import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shapeData: string) => void;
  initialShape?: string;
}

export const DrawingModal = ({ isOpen, onClose, onSave, initialShape }: DrawingModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [color, setColor] = useState("#06b6d4");

  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;

    // Clean up previous canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: "#1f2937",
      isDrawingMode: true,
    });

    // Set up the brush
    const brush = new PencilBrush(canvas);
    brush.color = color;
    brush.width = 3;
    canvas.freeDrawingBrush = brush;

    fabricCanvasRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    
    const brush = fabricCanvasRef.current.freeDrawingBrush;
    if (brush) {
      brush.color = color;
    }
  }, [color]);

  const handleClear = () => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.clear();
    fabricCanvasRef.current.backgroundColor = "#1f2937";
    fabricCanvasRef.current.renderAll();
  };

  const handleSave = () => {
    if (!fabricCanvasRef.current) return;
    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1,
    });
    onSave(dataUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Draw Your Custom Ball Shape
          </DialogTitle>
          <DialogDescription>
            Draw a custom shape for your ball. Use the color picker to change the drawing color.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-20 rounded cursor-pointer border border-border"
            />
          </div>
          
          <div className="border-2 border-primary/30 rounded-lg overflow-hidden">
            <canvas ref={canvasRef} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={handleClear}
            variant="outline"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Shape
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
