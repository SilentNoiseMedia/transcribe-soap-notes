"use client";

import { FileText, AlertCircle, Clipboard, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { SOAPNote as SOAPNoteType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SOAPNoteProps {
  soapNote: SOAPNoteType;
  confidence: number;
  bullets?: string[];
}

const sections: Array<{
  key: keyof SOAPNoteType;
  label: string;
  description: string;
}> = [
  {
    key: "subjective",
    label: "Subjective",
    description: "Patient-reported symptoms and history",
  },
  {
    key: "objective",
    label: "Objective",
    description: "Physical examination and findings",
  },
  {
    key: "assessment",
    label: "Assessment",
    description: "Clinical impression and diagnosis",
  },
  {
    key: "plan",
    label: "Plan",
    description: "Treatment and recommendations",
  },
];

export function SOAPNote({ soapNote, confidence, bullets }: SOAPNoteProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, sectionKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const copyAll = async () => {
    const fullText = sections
      .map((s) => `${s.label.toUpperCase()}:\n${soapNote[s.key]}`)
      .join("\n\n");
    await copyToClipboard(fullText, "all");
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">SOAP Note</h3>
            <p className="text-sm text-muted-foreground">
              AI-generated clinical documentation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
              confidence >= 0.8
                ? "bg-accent/10 text-accent"
                : confidence >= 0.5
                ? "bg-yellow-500/10 text-yellow-500"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {confidence >= 0.8 ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{Math.round(confidence * 100)}% confidence</span>
          </div>
          <button
            onClick={copyAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm text-foreground transition-colors"
          >
            {copiedSection === "all" ? (
              <CheckCircle className="w-4 h-4 text-accent" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
            <span>{copiedSection === "all" ? "Copied!" : "Copy All"}</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {sections.map((section) => (
          <div key={section.key} className="group">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-foreground">{section.label}</h4>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(soapNote[section.key], section.key)
                }
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-secondary transition-all"
                aria-label={`Copy ${section.label}`}
              >
                {copiedSection === section.key ? (
                  <CheckCircle className="w-4 h-4 text-accent" />
                ) : (
                  <Clipboard className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>
            <div className="bg-muted rounded-lg p-4 text-sm text-foreground leading-relaxed">
              {soapNote[section.key] || (
                <span className="text-muted-foreground italic">
                  No information available
                </span>
              )}
            </div>
          </div>
        ))}

        {bullets && bullets.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium text-foreground mb-3">Key Points</h4>
            <ul className="space-y-2">
              {bullets.slice(0, 5).map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
