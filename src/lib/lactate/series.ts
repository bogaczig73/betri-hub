/**
 * Chart series styling, shared by the client chart and the server page that
 * lists the same tests.
 *
 * This lives in its own plain module on purpose: every export of a
 * `"use client"` file becomes a client reference when a server component
 * imports it, so a palette exported from the chart itself reads back as
 * `undefined` on the server and the lines render with no stroke at all.
 */

export const SERIES_COLORS = [
  "#f13a2c", // the home tile's blood-drop red — newest test
  "#4c98b9",
  "#8b5cf6",
  "#e07b39",
  "#0f9b9b",
  "#03904a",
];

/**
 * Paired with the colours: red and green are the classic confusable pair, so
 * line style carries the series identity too. Past six tests both wrap and two
 * lines match — the legend dates still tell them apart.
 */
export const SERIES_DASHES = ["", "6 4", "2 4", "10 4 2 4", "1 4", "14 4"];
