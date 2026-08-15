// ═════════════════════════════════════════════════════════════════════════════
// src/core/state/EncounterGenerator.ts — Procedural & Pre-Authored Signal Encounters
// ═════════════════════════════════════════════════════════════════════════════

import encounter1 from '@data/encounters/encounter_001.json';
import encounter2 from '@data/encounters/encounter_002.json';
import encounter3 from '@data/encounters/encounter_003.json';
import baseDeck from '@data/cards/base_deck.json';
import type { EncounterConfig, PunchCard } from '@typings/index';

export class EncounterGenerator {
  private encounters: EncounterConfig[] = [
    encounter1 as EncounterConfig,
    encounter2 as EncounterConfig,
    encounter3 as EncounterConfig,
  ];

  get totalEncounters(): number {
    return this.encounters.length;
  }

  getEncounter(index: number): EncounterConfig | null {
    if (index >= 0 && index < this.encounters.length) {
      return this.encounters[index] ?? null;
    }
    return null;
  }

  getBaseDeck(): PunchCard[] {
    return (baseDeck as PunchCard[]).map((c) => ({ ...c }));
  }
}

export const encounterGenerator = new EncounterGenerator();
