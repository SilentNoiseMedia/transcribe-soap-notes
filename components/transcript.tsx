"use client";

import { Users, Clock, Download } from "lucide-react";
import type { SpeakerSegment } from "@/lib/types";
import { formatTimestamp, cn } from "@/lib/utils";

interface TranscriptProps {
  segments: SpeakerSegment[];
  speakerTimeline?: {
    speakers: Record<
      string,
      {
        total_duration: number;
        segment_count: number;
        words: number;
        percentage: number;
      }
    >;
    total_duration: number;
    unique_speakers: number;
  };
  onDownloadTxt?: () => void;
}

const speakerColors: Record<string, string> = {
  SPEAKER_00: "border-l-blue-500",
  SPEAKER_01: "border-l-emerald-500",
  SPEAKER_02: "border-l-amber-500",
  SPEAKER_03: "border-l-purple-500",
  SPEAKER_04: "border-l-pink-500",
};

const speakerBadgeColors: Record<string, string> = {
  SPEAKER_00: "bg-blue-500/10 text-blue-400",
  SPEAKER_01: "bg-emerald-500/10 text-emerald-400",
  SPEAKER_02: "bg-amber-500/10 text-amber-400",
  SPEAKER_03: "bg-purple-500/10 text-purple-400",
  SPEAKER_04: "bg-pink-500/10 text-pink-400",
};

function getSpeakerDisplayName(speaker: string): string {
  const num = speaker.replace("SPEAKER_", "");
  return `Speaker ${parseInt(num) + 1}`;
}

export function Transcript({
  segments,
  speakerTimeline,
  onDownloadTxt,
}: TranscriptProps) {
  const sortedSegments = [...segments].sort((a, b) => a.start - b.start);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Transcript</h3>
            <p className="text-sm text-muted-foreground">
              Speaker-identified dialogue
            </p>
          </div>
        </div>
        {onDownloadTxt && (
          <button
            onClick={onDownloadTxt}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-sm text-foreground transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download TXT</span>
          </button>
        )}
      </div>

      {speakerTimeline && (
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex flex-wrap gap-4">
            {Object.entries(speakerTimeline.speakers).map(
              ([speaker, data]) => (
                <div
                  key={speaker}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-xs font-medium",
                      speakerBadgeColors[speaker] ||
                        "bg-secondary text-muted-foreground"
                    )}
                  >
                    {getSpeakerDisplayName(speaker)}
                  </span>
                  <span className="text-muted-foreground">
                    {Math.round(data.percentage)}%
                  </span>
                  <span className="text-muted-foreground/50">
                    ({data.words} words)
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        <div className="p-4 space-y-3">
          {sortedSegments.map((segment, idx) => (
            <div
              key={idx}
              className={cn(
                "pl-4 py-3 pr-4 rounded-lg bg-muted/30 border-l-4",
                speakerColors[segment.speaker] || "border-l-gray-500"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    speakerBadgeColors[segment.speaker] ||
                      "bg-secondary text-muted-foreground"
                  )}
                >
                  {getSpeakerDisplayName(segment.speaker)}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(segment.start)} -{" "}
                  {formatTimestamp(segment.end)}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {segment.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
