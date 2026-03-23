"use client";

import { Clock, Users, FileText, Layers } from "lucide-react";

interface StatisticsProps {
  statistics: {
    total_segments: number;
    aligned_segments: number;
    merged_segments: number;
    unique_speakers: number;
    total_duration_minutes: number;
  };
  processingTime?: number;
}

export function Statistics({ statistics, processingTime }: StatisticsProps) {
  const stats = [
    {
      label: "Duration",
      value: `${statistics.total_duration_minutes.toFixed(1)} min`,
      icon: Clock,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Speakers",
      value: statistics.unique_speakers,
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Segments",
      value: statistics.aligned_segments,
      icon: Layers,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Processing",
      value: processingTime ? `${processingTime.toFixed(0)}s` : "N/A",
      icon: FileText,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.bgColor}`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
