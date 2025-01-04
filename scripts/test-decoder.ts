#!/usr/bin/env tsx

import { homedir } from "os";
import { join } from "path";

import { decodeBinaryCookies } from "../src/core/browsers/safari/decodeBinaryCookies";
import type { BinaryCookieRow } from "../src/types/schemas";

function getFlagDescriptions(flags: number): string[] {
  const descriptions: string[] = [];
  if ((flags & 0x1) !== 0) {descriptions.push('Secure');}
  if ((flags & 0x4) !== 0) {descriptions.push('HTTPOnly');}
  if ((flags & 0x8) !== 0) {descriptions.push('Unknown1');}
  if ((flags & 0x10) !== 0) {descriptions.push('Unknown2');}
  return descriptions;
}

function formatDate(timestamp: number, epochOffset: number): string {
  // Handle special cases
  if (timestamp === 0) {
    return 'Session Cookie (expires when browser closes)';
  }

  // Convert from seconds since 2001-01-01 to milliseconds since 1970-01-01
  const milliseconds = (timestamp + epochOffset) * 1000;

  try {
    const date = new Date(milliseconds);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toISOString();
  } catch {
    return 'Invalid Date';
  }
}

function displayCookie(cookie: BinaryCookieRow, index: number): void {
  const epochOffset = 978307200; // Seconds between 1970-01-01 and 2001-01-01

  console.log(`\nCookie ${index + 1}:`);
  console.log(`  Name: ${cookie.name}`);
  console.log(`  Value: ${typeof cookie.value === 'object' ? JSON.stringify(cookie.value) : cookie.value}`);
  console.log(`  Domain: ${cookie.domain}`);
  console.log(`  Path: ${cookie.path}`);
  console.log(`  Expiry: ${formatDate(cookie.expiry, epochOffset)}`);
  console.log(`  Creation: ${formatDate(cookie.creation, epochOffset)}`);
  console.log(`  Version: ${cookie.version}`);

  if (cookie.flags !== undefined) {
    const flagDescriptions = getFlagDescriptions(cookie.flags);
    console.log(`  Flags: ${cookie.flags.toString(2).padStart(8, '0')} (${flagDescriptions.join(', ')})`);
  }

  if (cookie.port !== undefined) {
    console.log(`  Port: ${cookie.port}`);
  }

  if (cookie.comment !== undefined && cookie.comment !== '') {
    console.log(`  Comment: ${cookie.comment}`);
  }

  if (cookie.commentURL !== undefined && cookie.commentURL !== '') {
    console.log(`  Comment URL: ${cookie.commentURL}`);
  }
}

function main(): void {
  const cookieDbPath = join(
    homedir(),
    'Library/Containers/com.apple.Safari/Data/Library/Cookies/Cookies.binarycookies'
  );

  try {
    const cookies = decodeBinaryCookies(cookieDbPath);
    console.log(`Successfully decoded ${cookies.length} cookies\n`);
    console.log('Sample cookies (first 5):');
    cookies.slice(0, 5).forEach((cookie, index) => displayCookie(cookie, index));
  } catch (error) {
    console.error('Error decoding cookies:', error);
  }
}

main();
