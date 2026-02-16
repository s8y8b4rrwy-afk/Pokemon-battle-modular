---
name: Design System Standards
description: Guidelines for maintaining visual consistency across the UI, based on the Summary Screen reference.
---

# UI Design Standards

This document establishes the design rules for sizes, spacing, and typography to ensure consistency with the retro aesthetic, derived from the `summary.css` reference.

## 1. Typography & Text Sizes

*   **Header Titles**: `10px` bold, uppercase.
    *   Example: `#sum-name`
*   **Body Text (Standard)**: `8px`.
    *   Example: `.sum-data`, `.move-pwr`
*   **Small Labels / Secondary Text**: `6px`.
    *   Example: `.move-name`, `.move-type`, `.exp-box span`
*   **Button Text**: `8px` or `10px` depending on prominence.

## 2. Spacing & Layout

*   **Screen Padding**: `8px` for main containers (e.g., `#summary-panel`).
*   **Gap (Tight)**: `2px` or `4px` (e.g., between stat rows).
*   **Gap (Standard)**: `8px` (e.g., between sprite and data).
*   **Borders**:
    *   **Major Dividers**: `2px solid #444` (or `#0f380f` for Pokedex).
    *   **Minor Dividers**: `1px dotted #ccc` (or `#306230` for Pokedex).
    *   **Containers**: `1px` or `2px` solid borders for boxes.

## 3. Sprite Sizes

*   **Large Display (Summary/Details)**:
    *   **Container**: `96px x 96px` (Summary) or `64px x 64px` (Pokedex Compact).
    *   **Image**: `96px` or `56px` respectively.
    *   *Always use `image-rendering: pixelated` and `object-fit: contain`.*
*   **Icons (List/Party)**:
    *   **Standard Icon**: `32px x 32px`.

## 4. Colors (Pokedex Specific)

While the Summary screen uses grayscale/white, the Pokedex uses a specific Game Boy palette:

*   **Background (Light)**: `#e0f8cf`
*   **Background (Medium)**: `#8bac0f`
*   **Foreground (Dark)**: `#0f380f`
*   **Accents/Borders**: `#306230`

## 5. UI Elements

*   **Buttons**:
    *   Should have a clear hover state.
    *   `cursor: pointer`.
    *   Padding: `4px` to `8px` minimum for clickability.
*   **Progress Bars**:
    *   Height: `6px`.
    *   Border-radius: `2px`.
*   **Tags (Type/Status)**:
    *   Padding: `2px 4px`.
    *   Border-radius: `2px`.
    *   Text: `6px` uppercase.

## Checklist for New Screens

1.  [ ] Are headers `10px` bold?
2.  [ ] Is body text `8px`?
3.  [ ] Are sprite containers properly sized (multiple of 8 preferably)?
4.  [ ] Is padding consistent (`8px` container, `4px` or `2px` gaps)?
5.  [ ] Are borders used to delineate sections clearly?

