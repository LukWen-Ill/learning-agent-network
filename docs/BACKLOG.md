# BACKLOG

Detta dokument innehåller planerade features och förbättringar för Slow LLM Coding Agent.

## Prio 1: Core Learning Features

### Feature: AI-genererad State-dokumentation
**Beskrivning:** När AI implementerar en feature åt användaren ska systemet automatiskt generera state-by-state dokumentation.

**Värde:** Skapar kursmaterial automatiskt när lärare/användare "vibecodar" en feature med AI:n. Varje implementation blir en navigerbar lektion för studenter.

**Krav:**
- Generera CodeState-objekt för varje logiskt steg i implementationen
- Inkludera kod-snapshot, diff, title och explanation
- Auto-generera tre explanation-nivåer (low/medium/high speed)
- Spara som strukturerad data (JSON/databas) för lätt navigation
- Låt användaren granska och redigera states innan publicering

**Teknisk approach:**
- Intercepta AI:ns kodgenerering och dela upp i diskreta states
- Varje state = en logisk enhet (t.ex. "Lägg till Button-komponent", "Implementera click handler")
- Generera explanations med AI baserat på kod-diff och kontext
- Lagra i databas enligt befintlig CodeState-schema

---

### Feature: Manuell State-dokumentation
**Beskrivning:** Lärare/användare kan manuellt lägga till, redigera och organisera states.

**Värde:** Ger kontroll över kursmaterial när auto-generering inte räcker. Möjliggör finpolering av lektioner.

**Krav:**
- UI för att skapa nya states manuellt
- Editor för att skriva kod, title, explanations (alla tre nivåer)
- Diff-beräkning mellan states (automatisk eller manuell)
- Ändra ordning på states (drag-and-drop eller up/down knappar)
- Ta bort eller mergea states
- Preview av hur state ser ut för studenten

**Teknisk approach:**
- Admin/lärar-gränssnitt separerat från student-vy
- Återanvänd CodeEditor-komponenten för kod-redigering
- Diff-beräkning med bibliotek (t.ex. `diff` eller `fast-diff`)
- CRUD API-endpoints för states

---

### Feature: Live State Tracking (Snapshot-system)
**Beskrivning:** När användaren skriver egen kod och sparar, skapas automatiska snapshots som states.

**Värde:** Studenter kan "ångra" och se sin egen kodhistorik, inte bara förbakade lektioner. Fungerar som en pedagogisk versionskontroll.

**Krav:**
- Automatisk snapshot när användare sparar (Ctrl+S eller explicit "Spara"-knapp)
- Valfri: Auto-save med konfigurerbart intervall (t.ex. var 30:e sekund)
- Generera minimal explanation automatiskt (t.ex. "Du ändrade rad 15-18")
- Intelligent diff-tracking (visa bara relevanta ändringar)
- Låt student lägga till egna anteckningar till varje snapshot
- Tidslinjevy som visar egen kodhistorik

**Teknisk approach:**
- Event listener på "save" i CodeEditor
- Beräkna diff mot föregående state
- Auto-generera simpel title: "Snapshot YYYY-MM-DD HH:MM" eller "Ändring i functionName()"
- Optional: AI-genererad förklaring av vad som ändrades
- Lagra i samma state-schema men markera som "user-generated" vs "lesson"
- Separata vyer: "Lektion" vs "Min historik"

---

## Prio 2: Post-MVP Features

(Flytta hit features från CLAUDE.md när de är mer detaljerade)

- Flera programmeringsspråk (JavaScript, Java, C++)
- Temperature modes (olika komplexitetsnivåer)
- Dynamisk kodgenerering via Mistral AI
- Användarkonton och progress tracking
- Gamification (badges, achievements)
