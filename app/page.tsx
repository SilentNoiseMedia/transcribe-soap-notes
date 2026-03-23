"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Mic,
  Users,
  FileText,
  Shield,
  Zap,
  Server,
  Play,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { FileUpload } from "@/components/file-upload";
import { ProcessingStatus } from "@/components/processing-status";
import { SOAPNote } from "@/components/soap-note";
import { Transcript } from "@/components/transcript";
import { Statistics } from "@/components/statistics";
import { FeatureCard } from "@/components/feature-card";
import { demoResult } from "@/lib/demo-data";
import type { ProcessingStatus as ProcessingStatusType, TranscriptionResult } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatusType>({
    status: "idle",
    message: "",
    progress: 0,
  });
  const [results, setResults] = useState<TranscriptionResult | null>(null);
  const [showDemo, setShowDemo] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPolling();
  }, [clearPolling]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setStatus({ status: "idle", message: "", progress: 0 });
    setResults(null);
    setShowDemo(false);
  }, []);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setStatus({ status: "idle", message: "", progress: 0 });
    setResults(null);
    clearPolling();
  }, [clearPolling]);

  const pollStatus = useCallback(
    async (jobId: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/status/${jobId}`);
        if (!response.ok) throw new Error("Status check failed");

        const data = await response.json();

        setStatus({
          status: data.status,
          message: data.message || "",
          progress: data.progress || 0,
          job_id: jobId,
        });

        if (data.status === "completed") {
          clearPolling();
          if (data.results) {
            setResults(data.results);
          } else {
            const resultsResponse = await fetch(`${API_BASE_URL}/results/${jobId}`);
            if (resultsResponse.ok) {
              const resultsData = await resultsResponse.json();
              setResults(resultsData);
            }
          }
        } else if (data.status === "error") {
          clearPolling();
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    },
    [clearPolling]
  );

  const handleStartTranscription = useCallback(async () => {
    if (!selectedFile) return;

    // Check if API is available
    if (!API_BASE_URL) {
      // Demo mode - show demo results after simulated processing
      setStatus({
        status: "processing",
        message: "Running demo transcription...",
        progress: 0,
      });

      // Simulate processing progress
      let progress = 0;
      const messages = [
        "Loading AI models...",
        "Transcribing audio with Whisper...",
        "Identifying speakers...",
        "Aligning transcript with speakers...",
        "Generating SOAP note...",
        "Finalizing results...",
      ];

      const interval = setInterval(() => {
        progress += 15;
        const messageIndex = Math.min(
          Math.floor(progress / 20),
          messages.length - 1
        );

        if (progress >= 100) {
          clearInterval(interval);
          setStatus({
            status: "completed",
            message: "Demo transcription complete!",
            progress: 100,
          });
          setResults(demoResult);
        } else {
          setStatus({
            status: "processing",
            message: messages[messageIndex],
            progress,
          });
        }
      }, 800);

      return;
    }

    setStatus({
      status: "uploading",
      message: "Uploading audio file...",
      progress: 5,
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: "Upload failed",
        }));
        throw new Error(errorData.detail || "Upload failed");
      }

      const data = await response.json();
      const jobId = data.job_id;

      setStatus({
        status: "processing",
        message: "Processing started...",
        progress: 10,
        job_id: jobId,
      });

      // Start polling
      pollingRef.current = setInterval(() => pollStatus(jobId), 2000);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus({
        status: "error",
        message: error instanceof Error ? error.message : "Upload failed",
        progress: 0,
      });
    }
  }, [selectedFile, pollStatus]);

  const handleViewDemo = useCallback(() => {
    setShowDemo(true);
    setResults(demoResult);
    setStatus({
      status: "completed",
      message: "Demo results loaded",
      progress: 100,
    });
  }, []);

  const handleDownloadTxt = useCallback(async () => {
    if (!results) return;

    // Generate text file content
    const lines: string[] = [];
    lines.push("AI Scribe - Medical Transcription");
    lines.push("=".repeat(50));
    lines.push("");

    if (results.soap_summary?.soap_note) {
      lines.push("SOAP NOTE SUMMARY");
      lines.push("-".repeat(20));
      lines.push("");
      lines.push("SUBJECTIVE:");
      lines.push(results.soap_summary.soap_note.subjective);
      lines.push("");
      lines.push("OBJECTIVE:");
      lines.push(results.soap_summary.soap_note.objective);
      lines.push("");
      lines.push("ASSESSMENT:");
      lines.push(results.soap_summary.soap_note.assessment);
      lines.push("");
      lines.push("PLAN:");
      lines.push(results.soap_summary.soap_note.plan);
      lines.push("");
      lines.push("=".repeat(50));
      lines.push("");
    }

    lines.push("SPEAKER DIALOGUE");
    lines.push("-".repeat(20));
    lines.push("");

    const sortedSegments = [...results.aligned_segments].sort(
      (a, b) => a.start - b.start
    );
    for (const segment of sortedSegments) {
      const timestamp = `[${segment.start.toFixed(1)}s - ${segment.end.toFixed(1)}s]`;
      const speaker = segment.speaker.replace("SPEAKER_", "Speaker ");
      lines.push(`${speaker} ${timestamp}:`);
      lines.push(`"${segment.text}"`);
      lines.push("");
    }

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results]);

  const isProcessing = status.status === "uploading" || status.status === "processing";
  const showResults = results && (status.status === "completed" || showDemo);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        {!showResults && (
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
              Transform Medical Conversations
              <br />
              <span className="text-primary">Into Clinical Documentation</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              AI-powered transcription with speaker diarization and automatic
              SOAP note generation. 100% offline, HIPAA-ready.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Upload Section */}
          {!showResults && (
            <div className="max-w-2xl mx-auto">
              <FileUpload
                onFileSelect={handleFileSelect}
                selectedFile={selectedFile}
                onClearFile={handleClearFile}
                disabled={isProcessing}
              />

              {selectedFile && status.status === "idle" && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={handleStartTranscription}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    Start Transcription
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="mt-6">
                  <ProcessingStatus
                    status={status.status}
                    message={status.message}
                    progress={status.progress}
                  />
                </div>
              )}

              {status.status === "error" && (
                <div className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive text-center">{status.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Demo Button */}
          {!showResults && !selectedFile && status.status === "idle" && (
            <div className="text-center">
              <button
                onClick={handleViewDemo}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>View demo results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Results Section */}
          {showResults && results && (
            <div className="space-y-8">
              {/* Back button */}
              <button
                onClick={() => {
                  setResults(null);
                  setShowDemo(false);
                  setSelectedFile(null);
                  setStatus({ status: "idle", message: "", progress: 0 });
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                &larr; New transcription
              </button>

              {/* Statistics */}
              <Statistics
                statistics={results.statistics}
                processingTime={results.metadata.processing_time_seconds}
              />

              {/* SOAP Note */}
              {results.soap_summary?.soap_note && (
                <SOAPNote
                  soapNote={results.soap_summary.soap_note}
                  confidence={results.soap_summary.confidence}
                  bullets={results.soap_summary.bullets}
                />
              )}

              {/* Transcript */}
              <Transcript
                segments={results.aligned_segments}
                speakerTimeline={results.speaker_timeline}
                onDownloadTxt={handleDownloadTxt}
              />
            </div>
          )}

          {/* Features Section */}
          {!showResults && (
            <div className="mt-16">
              <h3 className="text-xl font-semibold text-foreground text-center mb-8">
                Powered by State-of-the-Art AI
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={Mic}
                  title="Whisper Large v3"
                  description="OpenAI's most accurate speech recognition model for medical terminology and diverse accents."
                />
                <FeatureCard
                  icon={Users}
                  title="Speaker Diarization"
                  description="Pyannote v3.1 automatically identifies and separates different speakers in the conversation."
                />
                <FeatureCard
                  icon={FileText}
                  title="SOAP Generation"
                  description="Phi-3 Mini generates structured clinical notes following standard medical documentation format."
                />
                <FeatureCard
                  icon={Shield}
                  title="HIPAA Ready"
                  description="All processing happens locally on your machine. No audio data is ever transmitted externally."
                />
                <FeatureCard
                  icon={Zap}
                  title="GPU Accelerated"
                  description="Optimized for NVIDIA GPUs with int8 quantization for fast processing without sacrificing accuracy."
                />
                <FeatureCard
                  icon={Server}
                  title="100% Offline"
                  description="Once models are downloaded, no internet connection is required for transcription."
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              AI Scribe - Offline Medical Transcription
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Whisper Large v3</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Pyannote v3.1</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Phi-3 Mini</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
