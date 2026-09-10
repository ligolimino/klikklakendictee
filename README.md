# LWS Letterlab — casus, eisen en plan van aanpak

## 1. Aanleiding

Ligo maakt in Genially oefenreeksen voor volwassen anderstalige cursisten die leren lezen en schrijven. De doelgroep heeft vaak nog zeer weinig lees-, schrijf- en digitale vaardigheden. Daardoor moet de bediening uitzonderlijk eenvoudig en voorspelbaar zijn. De oefeninhoud moet centraal staan; cursorplaatsing, scrollen, kleine knoppen, automatische hoofdletters en tekstuele instructies mogen geen extra drempel vormen.

Genially bevat veel bruikbare oefenvormen, maar de bestaande invuloefening is niet geschikt voor het dicteren van één of meer letters of grafemen. Het invoerveld vraagt te fijne motoriek en het mobiele toetsenbord start vaak met hoofdletters. BookWidgets biedt meer mogelijkheden, maar de mobiele weergave bevat voor deze doelgroep te veel marges, scrollwerk en afleiding.

Daarom wordt een kleine, zelfstandige webtool ontwikkeld die in Genially kan worden ingesloten.

## 2. Primaire doelgroep

- Volwassen cursisten NT2 Alfa en andere beginnende lezers en schrijvers.
- Cursisten die nog niet of nauwelijks digitaal vaardig zijn.
- Gebruik hoofdzakelijk op een smartphone, zowel staand als liggend.
- Bediening moet ook bij beperkte fijne motoriek lukken.
- Tekstuele instructies op cursistenschermen worden zoveel mogelijk vermeden.

## 3. Gebruikers

### Cursist

De cursist moet zonder technische uitleg:

- een woord kunnen beluisteren;
- ontbrekende letters of grafemen typen;
- visueel zien of een antwoord juist of fout is;
- een fout antwoord rustig kunnen bekijken en zelf opnieuw beginnen;
- met een digitaal klik-klakboekje woorden en nonsenswoorden kunnen vormen;
- losse klanken en het samengestelde woord kunnen beluisteren.

### Lesgever

De lesgever moet zonder code te wijzigen:

- zelf dicteewoorden toevoegen;
- per woord aanduiden welke grafemen verdwijnen: één, meerdere of alle;
- tweeklanken en andere gekozen grafemen als één leereenheid behandelen;
- woorden uit een gecontroleerde woordenbank selecteren;
- eerst een woordstructuur kiezen: MKM, MMKM, MKMM of MMMKM;
- filteren op reeds aangeleerde letters en klinkertekens;
- woorden toevoegen aan of verwijderen uit een dicteereeks;
- nieuwe geldige woorden automatisch aan de lokale woordenbank toevoegen;
- de automatische uitspraak controleren;
- voor problematische woorden, nonsenswoorden en losse klanken eigen audio opnemen of uploaden.

## 4. Functionele eisen

### 4.1 Dictee

- Volledig kleinletter-AZERTY op het scherm.
- Geen activering van het mobiele systeemtoetsenbord.
- Grote toetsen en ruime aanraakvlakken.
- Eén of meerdere ontbrekende grafemen.
- Een tweeklank zoals `oe`, `aa` of `ui` wordt volledig getypt.
- Bij een fout blijft de ingevoerde letter zichtbaar.
- Opnieuw beginnen gebeurt met een duidelijk visueel symbool.
- Doorgaan gebeurt met een pijl, niet met randtekst.
- Zo weinig mogelijk woorden, labels en instructies op het cursistenscherm.
- Bestaande én nieuw toegevoegde dicteewoorden zijn verwijderbaar.

### 4.2 Woordgenerator

- Selectie van het patroon vóór de letterselectie.
- Ondersteuning voor minstens MKM, MMKM, MKMM en MMMKM.
- Filteren op aangeleerde medeklinkers en klinkertekens.
- Alleen bestaande, gecontroleerde woorden voorstellen.
- Medeklinkerclusters moeten mogelijk zijn.
- Een zichtbaar vinkje bevestigt dat een woord is toegevoegd.
- De volledige actuele dicteereeks blijft zichtbaar in het lesgeversgedeelte.
- Een handmatig toegevoegd woord komt automatisch in de eigen woordenbank.
- Verwijderen uit een oefenreeks verwijdert het woord niet uit de woordenbank.

### 4.3 Digitaal klik-klakboekje

- Afzonderlijk instelbare begin-, kern- en eindpositie.
- MKM als basis; later uitbreidbaar met clusters.
- Posities kunnen grafemen bevatten, niet alleen afzonderlijke letters.
- Grote visuele stroken met eenvoudige pijlen.
- Losse klanken kunnen afzonderlijk worden beluisterd.
- Het gevormde echte of nonsenswoord kan als geheel worden beluisterd.
- Auditieve controle moet onbeperkt herhaalbaar zijn.

### 4.4 Audio

- Losse medeklinkers worden fonetisch uitgesproken, bijvoorbeeld /mmm/ en niet “em”.
- Browsertekst-naar-spraak is alleen een tijdelijke benadering.
- De productieversie gebruikt goedgekeurde opnames en/of Belgisch-Nederlandse spraaksynthese.
- Eigen opname heeft altijd voorrang op automatische uitspraak.
- Daarna volgt eventueel een fonetische correctie.
- Automatische Vlaamse uitspraak is de terugvaloptie.
- Gegenereerde uitspraak wordt opgeslagen zodat ze niet telkens opnieuw hoeft te worden gemaakt.
- Lesgevers kunnen audio opnemen, uploaden, beluisteren, vervangen en verwijderen.
- Vooral korte plofklanken zoals /k/, /p/ en /t/ vereisen gecontroleerde opnames.

## 5. Vormgeving en toegankelijkheid

- Andika als lokaal meegeleverd lettertype.
- Andika is ontworpen voor alfabetisering en beginnende lezers.
- Moderne, volwassen vormgeving; niet kinderachtig.
- Ligo-aansluitende turkoois/blauwe basis met een warme roze accentkleur.
- Neutraal genoeg om in verschillende Genially-templates te passen.
- Grote contrasten, rustige achtergronden en duidelijke focus.
- Geen onnodige illustraties, animaties, marges of scrollbewegingen.
- Werkt op smartphone in staande en liggende stand.
- Volwaardige knoppen van minimaal ongeveer 44 × 44 pixels.
- Betekenis wordt niet uitsluitend met kleur aangegeven.

## 6. Genially-integratie

De cursistentool wordt als openbare webpagina in Genially ingesloten. De cursist ervaart de tool daardoor als onderdeel van de Genially-oefenreeks.

Voor de eerste test wordt GitHub Pages gebruikt:

- openbaar en gratis;
- gemakkelijk te vervangen;
- geschikt voor een statische, zelfstandige testversie;
- geen account of aanmelding nodig voor cursisten.

Het lesgeversgedeelte is in de testversie bereikbaar vanuit dezelfde tool. In de productieversie worden cursisten- en beheertoegang duidelijker gescheiden.

## 7. Overdraagbaarheid en zelfstandig voortbestaan

Dit is een harde ontwerpvoorwaarde.

### De basis blijft zelfstandig werken

Bestaande oefeningen mogen niet afhankelijk zijn van een actieve AI-dienst of database. De kern bestaat uit gewone webbestanden, JSON-gegevens en audiobestanden. Wanneer een externe dienst uitvalt, blijven reeds gepubliceerde oefeningen bruikbaar.

### Open en overdraagbare formaten

- Webinterface: HTML, CSS en JavaScript.
- Instellingen en oefeningen: JSON.
- Audio: gangbare formaten zoals MP3, WAV, M4A of WebM.
- Lettertype: lokaal meegeleverd onder de Open Font License.
- Volledige downloadbare back-up als ZIP.

### Eigenaarschap

Voor de productieversie:

- repository bij voorkeur onder een organisatieaccount van Ligo;
- minstens twee beheerders;
- algemeen werkmailadres als hersteladres;
- geen persoonlijke betaalkaart of persoonlijk account als enige toegang;
- korte beheer- en herstelhandleiding;
- jaarlijkse technische controle.

### Realistische grens

Een statische oefening kan jarenlang zonder actief beheer blijven werken. Nieuwe centrale uploads en automatische spraak blijven afhankelijk van online diensten die af en toe technisch gecontroleerd moeten worden. Daarom zijn die uitbreidingen aanvullend en mag de kern er niet van afhangen.

## 8. Gefaseerd plan

### Fase 1 — GitHub Pages-proef

- Zelfstandige statische versie maken.
- Andika lokaal inpakken.
- Dictee, woordgenerator en klik-klakboekje behouden.
- Instellingen en eigen audio voorlopig op het toestel bewaren.
- Publiceren via GitHub Pages.
- Insluiten en testen in Genially.
- Testen op verschillende Android- en iOS-toestellen, staand en liggend.

### Fase 2 — Didactische validatie

- Testen met enkele lesgevers en cursisten.
- Lettergrootte, toetsen, feedback en navigatie bijstellen.
- Woordstructuren en grafeemindeling controleren.
- Gecontroleerde woordenbank uitbreiden.
- Inspreeklijst voor losse klanken opstellen en opnemen.
- Automatische Vlaamse uitspraak vergelijken met eigen opnames.

### Fase 3 — Zelfstandig lesgeversbeheer

- Oefenreeksen benoemen, bewaren, dupliceren en verwijderen.
- Deelbare cursistenlink per oefenreeks.
- Import en export van oefeningen als JSON/ZIP.
- Audio centraal bewaren.
- Beheer afschermen van de openbare cursistenpagina.

### Fase 4 — Optionele Cloudflare-laag

- Cloudflare Pages voor automatische publicatie vanuit GitHub.
- D1 voor woorden, reeksen en metadata.
- R2 voor audio.
- Worker voor beveiligde koppeling met Vlaamse tekst-naar-spraak.
- Een eenmaal gemaakte uitspraak permanent cachen.
- Back-up en herstel zonder afhankelijkheid van Cloudflare documenteren.

## 9. Inhoud van dit GitHub-pakket

- `index.html`: startpagina en toegankelijke SVG-symbolen.
- `styles.css`: mobiele en liggende vormgeving.
- `app.js`: oefenlogica en lokaal lesgeversbeheer.
- `data.js`: gecontroleerde woordenbank, voorbeeldreeksen en klik-klaksets.
- `assets/fonts/`: Andika en de bijbehorende licentie.
- `assets/audio/klanken/`: vaste fonetische opnames van losse grafemen.
- `README.md`: deze casus, ontwerpvoorwaarden en het plan van aanpak.

## 10. Status van de proefversie

De GitHub Pages-versie is bedoeld om de bediening en Genially-integratie te testen. Lokale opslag is in deze fase bewust tijdelijk. Centrale synchronisatie, echte Vlaamse spraak en robuuste gedeelde audio-opslag worden pas toegevoegd nadat de cursisteninterface didactisch is goedgekeurd.

De meegeleverde klankopnames zijn gewone MP3-bestanden. Daardoor blijven ze ook bij een latere technische migratie herbruikbaar. De koppelingen staan leesbaar in `data.js`. Alleen de locatie van het audiobestand hoeft later eventueel aangepast te worden.
