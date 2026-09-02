/**
 * Keypad entry parsing.
 *
 * This is the only path by which a lactate reading or a pace gets into the
 * database. The coach types bare digits on a phone — "124" is 1.24 mmol/L,
 * "542" is 5:42 /km — so a wrong slice here writes a wrong number to an
 * athlete's test and every threshold downstream inherits it.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  digitsToLactate,
  digitsToTempo,
  formatLactate,
  formatTempo,
  initials,
  lactateToDigits,
  tempoToDigits,
} from "../src/lib/format";

test("digits become mmol/L with two decimals", () => {
  assert.equal(digitsToLactate("124"), 1.24);
  assert.equal(digitsToLactate("85"), 0.85);
  assert.equal(digitsToLactate("5"), 0.05);
  assert.equal(digitsToLactate("1864"), 18.64);
  assert.equal(digitsToLactate(""), null);
  assert.equal(digitsToLactate("abc"), null);
  assert.equal(digitsToLactate("1.2a4"), 1.24, "non-digits are stripped");
});

test("lactate survives the digits round-trip", () => {
  for (let cents = 0; cents <= 2500; cents++) {
    const value = cents / 100;
    assert.equal(
      digitsToLactate(lactateToDigits(value)),
      value,
      `round-trip failed at ${value}`,
    );
  }
  assert.equal(lactateToDigits(null), "");
  assert.equal(lactateToDigits(undefined), "");
});

test("digits become seconds per km, last two being the seconds", () => {
  assert.equal(digitsToTempo("542"), 5 * 60 + 42);
  assert.equal(digitsToTempo("1005"), 10 * 60 + 5);
  assert.equal(digitsToTempo("9"), 9, "partial entry is still parseable");
  assert.equal(digitsToTempo("330"), 3 * 60 + 30);
  assert.equal(digitsToTempo(""), null);
  assert.equal(digitsToTempo("5:42"), 5 * 60 + 42, "separators are stripped");
});

test("pace survives the digits round-trip across the dial's range", () => {
  // The run dial spans 120–720 s/km; check every second of it.
  for (let s = 120; s <= 720; s++) {
    assert.equal(digitsToTempo(tempoToDigits(s)), s, `round-trip failed at ${s}`);
  }
  assert.equal(tempoToDigits(null), "");
});

test("pace formats as m:ss with a padded seconds field", () => {
  assert.equal(formatTempo(342), "5:42");
  assert.equal(formatTempo(305), "5:05");
  assert.equal(formatTempo(300), "5:00");
  assert.equal(formatTempo(65), "1:05");
  assert.equal(formatTempo(null), "—");
  assert.equal(formatTempo(undefined), "—");
});

test("lactate formats to two decimals, from a number or a db string", () => {
  assert.equal(formatLactate(1.2), "1.20");
  assert.equal(formatLactate("1.235"), "1.24");
  assert.equal(formatLactate(null), "—");
  assert.equal(formatLactate(""), "—");
  assert.equal(formatLactate("not a number"), "—");
});

test("initials", () => {
  assert.equal(initials("Radim Bohac"), "RB");
  assert.equal(initials("Jan"), "JA");
  assert.equal(initials("Jan van der Berg"), "JB");
  assert.equal(initials("   "), "?");
});
