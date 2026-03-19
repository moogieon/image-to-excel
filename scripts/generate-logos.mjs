#!/usr/bin/env node
/**
 * Logo/Icon generation agent using Gemini 3 Pro (Image Preview)
 * Usage: node scripts/generate-logos.mjs
 * Reads GEMINI_API_KEY from .env
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load .env
function loadEnv() {
  const envPath = resolve(ROOT, '.env');
  if (!existsSync(envPath)) {
    console.error('.env file not found. Create one with GEMINI_API_KEY=...');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
}

loadEnv();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY not found in .env');
  process.exit(1);
}

const MODEL = 'gemini-3-pro-image-preview';
const OUTPUT_DIR = resolve(ROOT, 'public/images');

// Icon definitions to generate
const icons = [
  {
    name: 'logo-main',
    prompt: 'Generate an image: A minimal, clean app icon for a document-to-Excel converter tool. Green gradient (#217346 to #28A06A). A stylized spreadsheet grid merging with a document page. Flat design, no text, white background, suitable for a 512x512 app icon. Modern, professional, craft-made feel.',
  },
  {
    name: 'icon-table',
    prompt: 'Generate an image: A minimal flat icon representing table/grid structure recognition. Clean lines forming a simple data table with rows and columns. Green accent color (#217346). White background, 256x256, modern flat design, no shadows, no text. Hand-crafted style.',
  },
  {
    name: 'icon-secure',
    prompt: 'Generate an image: A minimal flat icon representing data security and privacy. A simple shield with a small lock symbol. Teal accent color (#0d9488). White background, 256x256, modern flat design, clean geometric shapes, no text. Hand-crafted style.',
  },
  {
    name: 'icon-export',
    prompt: 'Generate an image: A minimal flat icon representing flexible file export. A document with a download arrow. Emerald green accent (#059669). White background, 256x256, modern flat design, clean geometric shapes, no text. Hand-crafted style.',
  },
  {
    name: 'icon-upload',
    prompt: 'Generate an image: A minimal flat icon representing file upload or drag-and-drop. An upward arrow entering a cloud or folder shape. Green color (#217346). White background, 256x256, modern flat design, no text. Hand-crafted style.',
  },
  {
    name: 'icon-key',
    prompt: 'Generate an image: A minimal flat icon representing an API key or authentication. A simple key shape with warm amber/orange accent (#f59e0b). White background, 256x256, modern flat design, no text. Hand-crafted style.',
  },
];

async function generateImage(icon) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

  console.log(`Generating: ${icon.name}...`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: icon.prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Failed to generate ${icon.name}: ${res.status} ${errorText}`);
    return false;
  }

  const data = await res.json();
  const candidates = data.candidates;

  if (!candidates || candidates.length === 0) {
    console.error(`No candidates returned for ${icon.name}`);
    return false;
  }

  // Find the image part in the response
  const parts = candidates[0].content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);

  if (!imagePart) {
    console.error(`No image data in response for ${icon.name}`);
    const textPart = parts.find((p) => p.text);
    if (textPart) console.log(`  Response text: ${textPart.text.slice(0, 200)}`);
    return false;
  }

  const { mimeType, data: b64Data } = imagePart.inlineData;
  const ext = mimeType.includes('png') ? 'png' : 'jpg';

  const outputPath = resolve(OUTPUT_DIR, `${icon.name}.${ext}`);
  writeFileSync(outputPath, Buffer.from(b64Data, 'base64'));
  console.log(`Saved: ${outputPath}`);
  return true;
}

async function main() {
  console.log(`Image2Excel Logo Generator (${MODEL})\n`);

  let success = 0;
  let failed = 0;

  for (const icon of icons) {
    try {
      const ok = await generateImage(icon);
      if (ok) success++;
      else failed++;
    } catch (err) {
      console.error(`Error generating ${icon.name}:`, err.message);
      failed++;
    }
    // Small delay between requests to avoid rate limiting
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log(`\nDone: ${success} generated, ${failed} failed`);
  console.log(`Output: ${OUTPUT_DIR}/`);
}

main();
