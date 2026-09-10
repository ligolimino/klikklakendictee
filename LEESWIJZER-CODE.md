# Leeswijzer bij de code

Deze versie is bewust geschreven als een leerproject. Veel code kan technisch korter, maar staat over meerdere regels zodat je gemakkelijker kunt volgen wat er gebeurt.

## In welke volgorde bekijken?

### 1. `data.js`

Begin hier. Dit bestand bevat vooral objecten en arrays:

- de eerste dicteewoorden;
- de woordenbank;
- de letters en grafemen;
- de rijen van het AZERTY-toetsenbord;
- de stroken van het klik-klakboekje.
- de koppeling tussen grafemen en vaste audiobestanden.

Hier kun je veilig woorden en letters toevoegen. Let goed op komma's, aanhalingstekens en vierkante haakjes.

Bij `builtInAudio` zie je hoe een klank aan een MP3-bestand wordt gekoppeld. Zo'n regel ziet er bijvoorbeeld zo uit:

```javascript
"sound:m": "assets/audio/klanken/m.mp3",
```

Twee schrijfwijzen kunnen ook naar dezelfde klankopname verwijzen. Bij `ij` en `ei` gebeurt dat zo:

```javascript
"sound:ij": "assets/audio/klanken/ij-ei.mp3",
"sound:ei": "assets/audio/klanken/ij-ei.mp3",
```

De app speelt bij iedere klik slechts het ene gekoppelde bestand af. Dezelfde werkwijze wordt gebruikt voor `ou` en `au`:

```javascript
"sound:ou": "assets/audio/klanken/ou.mp3",
"sound:au": "assets/audio/klanken/ou.mp3",
```

### 2. `index.html`

Dit is het vaste skelet. De zichtbare schermen staan hier niet volledig in: JavaScript bouwt ze op in het element met `id="app"`. De lange lijst `symbol`-elementen bevat de pictogrammen.

### 3. `styles.css`

Dit bestand bepaalt de vormgeving. Het is in acht delen verdeeld. De belangrijkste kleuren staan helemaal bovenaan bij `:root`. Daardoor kun je bijvoorbeeld één kleur aanpassen zonder alle CSS-regels te doorzoeken.

### 4. `app.js`

Dit bestand bevat de werking en is opgedeeld in zeven genummerde delen:

1. vaste gegevens en opslag;
2. kleine hulpfuncties;
3. woorden en grafemen;
4. audio;
5. schermen opbouwen;
6. opnemen en woorden toevoegen;
7. reageren op typen, kiezen en klikken.

## Belangrijke JavaScriptbegrippen in deze app

### `state`

Het object `state` is het tijdelijke geheugen van de app. Het onthoudt bijvoorbeeld:

- welk scherm openstaat;
- bij welk dicteewoord de cursist zit;
- wat al getypt werd;
- welke woordstructuur de lesgever koos.

Na een verandering wordt een scherm opnieuw opgebouwd vanuit die actuele toestand.

### Functies

Elke functie heeft zo veel mogelijk één herkenbare taak. Bijvoorbeeld:

- `tokenize()` verdeelt een woord in grafemen;
- `patternOf()` bepaalt of een woord MKM, MMKM enzovoort is;
- `dictation()` bouwt het dicteescherm;
- `saveToStorage()` bewaart lokale wijzigingen;
- `addWord()` voegt een dicteewoord toe.

### `data-*`-attributen

Knoppen krijgen kenmerken zoals `data-action="retry"` of `data-key="a"`. De centrale klikfunctie leest dat kenmerk en beslist wat er moet gebeuren. Daardoor heeft niet elke knop een aparte event listener nodig.

### Template strings

HTML die JavaScript opbouwt, staat tussen backticks. Met `${...}` wordt een waarde in die HTML geplaatst:

```javascript
const name = "Miet";
const sentence = `<p>Hallo ${name}</p>`;
```

### `localStorage`

`localStorage` bewaart gegevens in de browser. Daarom blijven lokaal toegevoegde woorden na het sluiten van de pagina bestaan. Ze worden in deze proefversie nog niet naar GitHub of naar andere toestellen verstuurd.

### Instellingen in een cursistenlink

Een klaargezette oefening wordt met `encodeExercise()` omgezet naar compacte tekst in de link. De dictee- of klik-klakpagina zet die tekst met `decodeExerciseFromUrl()` terug om naar instellingen. Zo kan één gepubliceerde app veel verschillende oefeningen openen zonder database.

In een grotere productieomgeving zouden oefeningen meestal centraal in een database staan en alleen een korte identificatiecode in de link krijgen. De huidige oplossing is bewust zelfstandig en geschikt voor de GitHub-proef.

## Goede werkwijze bij zelf aanpassen

1. Bewaar eerst een kopie van de werkende versie.
2. Verander telkens maar één klein onderdeel.
3. Vernieuw de pagina en test zowel het cursisten- als lesgeversgedeelte.
4. Kijk bij een fout eerst naar haakjes, komma's en aanhalingstekens.
5. Upload pas naar GitHub wanneer de lokale versie nog volledig werkt.

Een goede eerste oefening is een woord aan `wordBank` toevoegen. Daarna kun je de standaardletters van het klik-klakboekje veranderen, een kleur aanpassen en uiteindelijk een kleine functie wijzigen.
