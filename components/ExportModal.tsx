"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyText: () => string;
  onExportSheet: () => void;
  title?: string;
}

export function ExportModal({
  open,
  onOpenChange,
  onCopyText,
  onExportSheet,
  title = "Export Data",
}: ExportModalProps) {
  const handleCopyText = () => {
    try {
      const text = onCopyText();
      navigator.clipboard.writeText(text);
      toast.success("Text copied to clipboard");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy text");
    }
  };

  const handleExportSheet = () => {
    try {
      onExportSheet();
      toast.success("Sheet exported successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to export sheet:", error);
      toast.error("Failed to export sheet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose how you want to export the data
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={handleCopyText}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy as Text
          </Button>
          <Button
            onClick={handleExportSheet}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export to Sheet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

