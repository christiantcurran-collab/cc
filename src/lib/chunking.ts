import type { ChunkingStrategy } from "./types";

export interface ChunkResult {
  text: string;
  startIndex: number;
  endIndex: number;
}

export function chunkText(
  text: string,
  strategy: ChunkingStrategy,
  chunkSize: number,
  overlapPercent: number
): ChunkResult[] {
  const overlap = Math.floor(chunkSize * (overlapPercent / 100));

  switch (strategy) {
    case "fixed":
      return fixedSizeChunking(text, chunkSize, overlap);
    case "sentence":
      return sentenceBasedChunking(text, chunkSize, overlap);
    case "paragraph":
      return paragraphBasedChunking(text, chunkSize, overlap);
    case "recursive":
      return recursiveChunking(text, chunkSize, overlap);
    default:
      return fixedSizeChunking(text, chunkSize, overlap);
  }
}

// Approximate token count (rough: 1 token ≈ 4 chars for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function fixedSizeChunking(
  text: string,
  chunkSize: number,
  overlapChars: number
): ChunkResult[] {
  const charSize = chunkSize * 4; // Convert tokens to approximate chars
  const charOverlap = overlapChars * 4;
  const chunks: ChunkResult[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + charSize, text.length);
    chunks.push({
      text: text.slice(start, end).trim(),
      startIndex: start,
      endIndex: end,
    });
    start += charSize - charOverlap;
    if (start >= text.length) break;
  }

  return chunks.filter((c) => c.text.length > 0);
}

function sentenceBasedChunking(
  text: string,
  chunkSize: number,
  overlapChars: number
): ChunkResult[] {
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];
  const chunks: ChunkResult[] = [];
  let currentChunk = "";
  let chunkStart = 0;
  let currentPos = 0;

  for (const sentence of sentences) {
    if (
      estimateTokens(currentChunk + sentence) > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex: chunkStart,
        endIndex: currentPos,
      });
      // Overlap: keep last portion
      const overlapText = currentChunk.slice(-overlapChars * 4);
      currentChunk = overlapText + sentence;
      chunkStart = currentPos - overlapText.length;
    } else {
      currentChunk += sentence;
    }
    currentPos += sentence.length;
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      startIndex: chunkStart,
      endIndex: currentPos,
    });
  }

  return chunks;
}

function paragraphBasedChunking(
  text: string,
  chunkSize: number,
  overlapChars: number
): ChunkResult[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const chunks: ChunkResult[] = [];
  let currentChunk = "";
  let chunkStart = 0;
  let currentPos = 0;

  for (const para of paragraphs) {
    if (
      estimateTokens(currentChunk + "\n\n" + para) > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        text: currentChunk.trim(),
        startIndex: chunkStart,
        endIndex: currentPos,
      });
      const overlapText = currentChunk.slice(-overlapChars * 4);
      currentChunk = overlapText + para;
      chunkStart = currentPos - overlapText.length;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
    currentPos += para.length + 2;
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      startIndex: chunkStart,
      endIndex: currentPos,
    });
  }

  return chunks;
}

function recursiveChunking(
  text: string,
  chunkSize: number,
  overlapChars: number
): ChunkResult[] {
  const separators = ["\n\n\n", "\n\n", "\n", ". ", " "];
  return recursiveSplit(text, separators, chunkSize, overlapChars, 0);
}

function recursiveSplit(
  text: string,
  separators: string[],
  chunkSize: number,
  overlapChars: number,
  offset: number
): ChunkResult[] {
  if (estimateTokens(text) <= chunkSize) {
    return text.trim().length > 0
      ? [{ text: text.trim(), startIndex: offset, endIndex: offset + text.length }]
      : [];
  }

  const separator = separators[0] || " ";
  const remainingSeparators = separators.slice(1);
  const parts = text.split(separator);

  const chunks: ChunkResult[] = [];
  let currentChunk = "";
  let currentOffset = offset;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const testChunk = currentChunk ? currentChunk + separator + part : part;

    if (estimateTokens(testChunk) > chunkSize && currentChunk.length > 0) {
      // Current chunk is full; if it's still too big, recurse with next separator
      if (estimateTokens(currentChunk) > chunkSize && remainingSeparators.length > 0) {
        chunks.push(
          ...recursiveSplit(currentChunk, remainingSeparators, chunkSize, overlapChars, currentOffset)
        );
      } else {
        chunks.push({
          text: currentChunk.trim(),
          startIndex: currentOffset,
          endIndex: currentOffset + currentChunk.length,
        });
      }
      const overlapText = currentChunk.slice(-overlapChars * 4);
      currentOffset = currentOffset + currentChunk.length - overlapText.length;
      currentChunk = overlapText + part;
    } else {
      currentChunk = testChunk;
    }
  }

  if (currentChunk.trim().length > 0) {
    if (estimateTokens(currentChunk) > chunkSize && remainingSeparators.length > 0) {
      chunks.push(
        ...recursiveSplit(currentChunk, remainingSeparators, chunkSize, overlapChars, currentOffset)
      );
    } else {
      chunks.push({
        text: currentChunk.trim(),
        startIndex: currentOffset,
        endIndex: currentOffset + currentChunk.length,
      });
    }
  }

  return chunks;
}

export const CHUNKING_DESCRIPTIONS: Record<ChunkingStrategy, string> = {
  fixed: "Splits text into fixed-size chunks based on token count. Simple but may split mid-sentence.",
  sentence: "Groups complete sentences up to the token limit. Preserves sentence boundaries for better coherence.",
  paragraph: "Groups complete paragraphs up to the token limit. Best for well-structured documents like the FCA Handbook.",
  recursive: "Tries larger separators first (paragraphs, then sentences, then words). Best balance of coherence and size control.",
};
