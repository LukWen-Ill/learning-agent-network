# Slow LLM Coding Agent - MVP Dokumentation

## Projektöversikt

En interaktiv kodnings-läroplattform där studenter lär sig programmering genom att koda tillsammans med en AI-lärare som de kan "spola tillbaka" för att se exakt hur koden utvecklades steg för steg.

**Målgrupp**: Studenter som vill lära sig programmering med AI som lärarverktyg

---

## Kärnkoncept

Student och AI arbetar tillsammans på ett kodprojekt. Studenten kan:
- **Pausa och spola tillbaka** till vilket kodsteg som helst
- **Se exakt vad som ändrades** vid varje steg
- **Fråga AI varför** en viss förändring gjordes
- **Styra hur mycket hjälp** de får från AI

---

## Tre huvudkontroller

### 1. Speed (Hjälpnivå)
Hur mycket läraren (AI) intervenerar:
- **Låg**: AI kodar mest, du tittar och lär
- **Medium**: Du och AI kodar tillsammans, 50/50
- **Hög**: Du kodar mest, AI guidar bara när du behöver

### 2. Temperature (Svårighetsgrad / Modes)
Komplexitet i kod och förklaringar:
- **"Snällare kod"**: Enkel, pedagogisk, välkommenterad kod
- **"Normal coder"**: Standard best practices
- **"Hardcore coder"**: Avancerad, idiomatisk, optimerad kod

### 3. Language
Vilket programmeringsspråk att lära sig: Python, JavaScript, Java, C++, etc.

---

## Kärnfunktioner

### 1. Granulär "tidsresa" i koden
- Varje kodändring = ett "state" (som Git commit, men finare)
- Granularitet: Per rad, per funktion, per klass
- Student navigerar: "Gå tillbaka 5 steg", "Hoppa till när funktionen skapades"
- Jämför: Se kod "före" och "efter" vid varje state

### 2. State-baserad chatbox
- Varje state har en kopplad chatbox
- Student kan fråga: "Varför ändrade du detta?", "Vad gör denna rad?"
- AI svarar i kontexten av just det steget

### 3. Färdiga projektmallar
- Statiskt förberedda projekt för nybörjare
- Exempel: "Bygg en TODO-app", "Skapa en kalkylator", "Gör ett enkelt spel"
- Student väljer projekt → AI visar steg-för-steg hur man bygger det

### 4. Gamification
- Achievement system: "Skrev din första funktion", "Debuggade utan hjälp"
- Progress tracking: Hur många steg har du klarat själv?
- Olika svårighetsnivåer på projekt

---

## MVP Scope (Vad ska vi bygga först?)

### Måste ha (Core MVP):
1. **Kod-editor med split-view**
   - Vänster: Nuvarande kod
   - Höger: AI:ns förklaring av steget

2. **State navigation**
   - "Nästa steg" / "Föregående steg" knappar
   - Timeline slider: Dra för att hoppa mellan states

3. **Ett färdigt projekt** (t.ex. "Bygg en kalkylator i Python")
   - Hårdkodat, 10-15 steg
   - Varje steg = en kodändring + förklaring

4. **Basic kontroller**
   - Speed slider (3 nivåer)
   - Language selector (börja med bara Python)

5. **Chatbox per state**
   - Student kan fråga om nuvarande kod
   - AI svarar i kontexten

### Kan vänta (Post-MVP):
- Temperature/modes (använd bara "normal" i MVP)
- Flera språk (börja med Python)
- Dynamisk kodgenerering (använd hårdkodade projekt först)
- Advanced gamification
- User accounts & progress saving

---

## Teknisk arkitektur (MVP)

### Frontend
**React + TypeScript** (enkelt, snabbt att bygga)

Komponenter:
- `<CodeViewer>` - Visar kod med syntax highlighting
- `<StateNavigator>` - Timeline slider + steg-knappar
- `<Chatbox>` - Fråga AI om nuvarande state
- `<ControlPanel>` - Speed, language selectors
- `<ExplanationPanel>` - Visar AI:ns förklaring av steget

### Backend / Data
**Hårdkodade JSON-filer först** (snabbast för MVP)

```json
{
  "project": "calculator",
  "language": "python",
  "states": [
    {
      "id": 0,
      "code": "# Tom fil",
      "explanation": "Vi börjar med en tom Python-fil",
      "diff": null
    },
    {
      "id": 1,
      "code": "def add(a, b):\n    return a + b",
      "explanation": "Skapa en funktion för addition",
      "diff": {
        "added": ["def add(a, b):", "    return a + b"],
        "removed": []
      }
    }
    // ... fler states
  ]
}
```

### AI Integration
**Anthropic Claude API** för chatbox

- När student frågar något vid state X → skicka kod + förklaring från det steget + frågan till Claude
- Claude svarar i kontexten

---

## MVP Implementation Plan

### Sprint 1: Basic structure (1-2 dagar)
- [ ] Setup React project
- [ ] Skapa basic UI layout (editor + navigator + chatbox)
- [ ] Implementera state navigation (nästa/föregående)
- [ ] Ladda hårdkodad projekt-data från JSON

### Sprint 2: Core features (2-3 dagar)
- [ ] Syntax highlighting i code viewer
- [ ] Diff visualization (visa vad som ändrats)
- [ ] Timeline slider
- [ ] Speed control (påverkar förklaringars längd)

### Sprint 3: AI integration (1-2 dagar)
- [ ] Integrera Claude API för chatbox
- [ ] State-context till AI-frågor
- [ ] Basic error handling

### Sprint 4: Polish (1 dag)
- [ ] Ett komplett projekt hårdkodat (kalkylator)
- [ ] Basic styling
- [ ] Test & bugfix

**Total MVP tid: 5-8 dagar**

---

## Tekniska beslut för snabbare MVP

### ✅ Offra dessa för snabbhet:
1. **Dynamisk kodgenerering** → Hårdkoda projekt istället
2. **Multiple languages** → Bara Python i MVP
3. **Temperature modes** → Bara "normal" i MVP
4. **User accounts** → Ingen inloggning i MVP
5. **Advanced gamification** → Spara till senare
6. **Backend database** → JSON-filer räcker

### ✅ Behåll dessa (core value):
1. **State navigation** - Detta är unikt!
2. **Chatbox per state** - Viktigt för lärande
3. **Speed control** - Differentierar olika inlärningsstilar
4. **Ett komplett projekt** - Måste finnas för demo

---

## Nästa steg

1. **Skapa wireframes/mockups** (30 min med Figma/papper)
2. **Setup React projekt** (30 min)
3. **Hårdkoda ett exempel-projekt** (2-3 tim)
4. **Bygg basic UI** (4-6 tim)
5. **Implementera state navigation** (2-3 tim)
6. **Integrera Claude API** (2-3 tim)

---

## Framtida funktioner (Post-MVP)

- Dynamisk kodgenerering med Claude
- Flera programmeringsspråk
- Temperature modes (snäll/normal/hardcore)
- User progress tracking
- Achievements & badges
- Community-skapade projekt
- Live-kodning tillsammans med AI
- Exportera projekt till GitHub

---

## Frågor att svara på innan vi börjar koda

1. **Plattform**: Web app (i browser) eller desktop app?
2. **Hosting**: Lokal först eller direkt till molnet?
3. **Första projekt**: Kalkylator, TODO-app, eller något annat?
4. **Målgrupp**: Absoluta nybörjare eller folk med lite erfarenhet?

---

**Version**: 1.0 MVP  
**Datum**: 2026-01-18  
**Status**: Planering
