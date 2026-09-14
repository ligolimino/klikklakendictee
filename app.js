(() => {
  "use strict";

  // ================================================================
  // 1. BASIS: vaste gegevens, HTML-elementen en opslag
  // ================================================================

  const DATA = window.LETTERLAB_DATA;
  const app = document.querySelector("#app");
  const APP_TYPE = document.body.dataset.app || "beheer";

  const STORAGE_KEYS = {
    questions: "letterlab-questions-v1",
    custom: "letterlab-custom-words-v1",
    audio: "letterlab-audio-v1",
    exercises: "letterlab-exercises-v1",
  };

  function loadFromStorage(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function decodeExerciseFromUrl() {
    try {
      const parameters = new URLSearchParams(location.hash.slice(1));
      const encodedExercise = parameters.get("oefening");

      if (!encodedExercise) {
        return null;
      }

      const base64 = encodedExercise.replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(base64), (character) =>
        character.charCodeAt(0),
      );

      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  }

  function encodeExercise(exercise) {
    const bytes = new TextEncoder().encode(JSON.stringify(exercise));
    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function makeExerciseUrl(type, settings) {
    const url = new URL(`${type}/`, DATA.baseUrl);
    url.hash = `oefening=${encodeExercise(settings)}`;
    return url.href;
  }

  const sharedExercise = decodeExerciseFromUrl();

  // In state bewaren we alles wat tijdens het gebruik kan veranderen.
  const state = {
    mode:
      APP_TYPE === "dictee"
        ? "dictation"
        : APP_TYPE === "klikklak"
          ? "booklet"
          : "manage",
    questions:
      APP_TYPE === "dictee" && sharedExercise?.questions
        ? sharedExercise.questions
        : loadFromStorage(STORAGE_KEYS.questions, DATA.questions),
    customWords: loadFromStorage(STORAGE_KEYS.custom, []),
    audio: loadFromStorage(STORAGE_KEYS.audio, {}),
    currentQuestionIndex: 0,
    typed: "",
    result: "",
    pattern: "MKM",
    learnedGraphemes: new Set(DATA.learnedDefault),
    draftWord: "",
    missingGraphemes: new Set(),
    bookPositions: [0, 0, 0],
    bookGroups:
      APP_TYPE === "klikklak" && sharedExercise?.groups
        ? sharedExercise.groups
        : [DATA.clickBook.begin, DATA.clickBook.kern, DATA.clickBook.einde],
    exerciseName: "",
    clickBookDraft: {
      begin: DATA.clickBook.begin.join(", "),
      kern: DATA.clickBook.kern.join(", "),
      einde: DATA.clickBook.einde.join(", "),
    },
    exercises: loadFromStorage(STORAGE_KEYS.exercises, []),
    recording: null,
  };

  function saveToStorage() {
    localStorage.setItem(
      STORAGE_KEYS.questions,
      JSON.stringify(state.questions),
    );
    localStorage.setItem(
      STORAGE_KEYS.custom,
      JSON.stringify(state.customWords),
    );
    localStorage.setItem(STORAGE_KEYS.audio, JSON.stringify(state.audio));
    localStorage.setItem(
      STORAGE_KEYS.exercises,
      JSON.stringify(state.exercises),
    );
  }

  // ================================================================
  // 2. KLEINE HULPFUNCTIES
  // ================================================================

  // Voorkomt dat ingevoerde tekst als HTML wordt uitgevoerd.
  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"]/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
        })[character],
    );
  }

  function icon(name) {
    return `<svg class="icon" aria-hidden="true">
      <use href="#i-${name}"></use>
    </svg>`;
  }

  function iconButton(name, action, label, extraClass = "") {
    return `<button
      class="icon-btn ${extraClass}"
      data-action="${action}"
      aria-label="${label}"
      title="${label}"
    >${icon(name)}</button>`;
  }

  function header(showSettings = true) {
    if (APP_TYPE === "dictee" || APP_TYPE === "klikklak") {
      return "";
    }
    let leftSide = '<span class="brand">Letterlab</span>';
    if (state.mode !== "home") {
      leftSide = iconButton("back", "home", "Terug");
    }

    const settingsButton = showSettings
      ? iconButton("gear", "manage", "Instellingen")
      : "";

    return `<header class="topbar">
      <div>${leftSide}</div>
      <div class="top-actions">${settingsButton}</div>
    </header>`;
  }

  // ================================================================
  // 3. WOORDEN EN GRAFEMEN
  // ================================================================

  function tokenize(word) {
    const clean = word
      .toLowerCase()
      .trim()
      .replace(/[^a-zà-ÿ]/g, "");
    const out = [];
    let i = 0;
    const compounds = [...DATA.compoundGraphemes].sort(
      (a, b) => b.length - a.length,
    );
    while (i < clean.length) {
      const found = compounds.find((x) => clean.startsWith(x, i));
      out.push(found || clean[i]);
      i += (found || clean[i]).length;
    }
    return out;
  }

  function graphemeType(grapheme) {
    return DATA.vowels.includes(grapheme) ? "K" : "M";
  }

  function patternOf(word) {
    return tokenize(word).map(graphemeType).join("");
  }

  function ownAudio(key) {
    return state.audio[key];
  }

  function builtInAudio(key) {
    return DATA.builtInAudio[key];
  }

  // ================================================================
  // 4. AUDIO
  // ================================================================

  function speak(text, key = text) {
    // Volgorde van voorkeur:
    // 1. een opname die de lesgever in de app toevoegde;
    // 2. een vaste opname uit assets/audio/klanken;
    // 3. de automatische browserstem als noodoplossing.
    const selectedAudio = ownAudio(key) || builtInAudio(key);

    if (selectedAudio) {
      const resolvedAudio = selectedAudio.startsWith("data:")
        ? selectedAudio
        : new URL(selectedAudio, DATA.baseUrl).href;

      new Audio(resolvedAudio).play().catch(() => {});
      return;
    }
    if (!("speechSynthesis" in window)) {
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      DATA.soundPrompts[text] || text,
    );
    utterance.lang = "nl-BE";
    utterance.rate = 0.72;
    speechSynthesis.speak(utterance);
  }

  function getCurrentQuestion() {
    return state.questions[state.currentQuestionIndex] || DATA.questions[0];
  }

  function getExpectedAnswer(question = getCurrentQuestion()) {
    return question.missing.map((index) => question.graphemes[index]).join("");
  }

  // ================================================================
  // 5. SCHERMEN OPBOUWEN
  // ================================================================

  function home() {
    app.innerHTML = `${header()}<section class="screen"><div class="home-grid">
      <button class="mode-card" data-action="dictation" aria-label="Dictee">${icon("keyboard")}</button>
      <button class="mode-card" data-action="booklet" aria-label="Klik-klakboekje">${icon("book")}</button>
    </div></section>`;
  }
  function dictation() {
    if (!state.questions.length) {
      state.mode = "home";
      home();
      return;
    }
    if (state.currentQuestionIndex >= state.questions.length) {
      dictationFinished();
      return;
    }
    const question = getCurrentQuestion();
    const missingOrder = question.missing;
    const typedChunks = {};

    let offset = 0;

    missingOrder.forEach((index) => {
      const graphemeLength = question.graphemes[index].length;
      typedChunks[index] = state.typed.slice(offset, offset + graphemeLength);
      offset += graphemeLength;
    });

    const slots = question.graphemes
      .map((grapheme, index) => {
        if (!question.missing.includes(index)) {
          return `<span class="slot">${escapeHtml(grapheme)}</span>`;
        }

        const minimumWidth = Math.max(48, grapheme.length * 42);
        const typedChunk = typedChunks[index] || " ";

        return `<span
          class="slot missing ${state.result}"
          style="min-width:${minimumWidth}px"
        >${escapeHtml(typedChunk)}</span>`;
      })
      .join("");

    let feedback = '<div class="feedback"></div>';
    if (state.result === "good") {
      feedback = `<div class="feedback good">
        ${icon("check")}
        ${iconButton("next", "next-question", "Volgende", "good")}
      </div>`;
    }
    if (state.result === "wrong") {
      feedback = `<div class="feedback bad">
        ${icon("close")}
        ${iconButton("retry", "retry", "Opnieuw", "bad")}
      </div>`;
    }

    const keyboardRows = DATA.keyboard
      .map(
        (row) =>
          `<div class="key-row">
            ${row
              .map(
                (letter) =>
                  `<button class="key" data-key="${letter}">${letter}</button>`,
              )
              .join("")}
          </div>`,
      )
      .join("");

    app.innerHTML = `${header()}
      <section class="screen dictation">
        <button class="listen" data-action="speak-word" aria-label="Luister">
          ${icon("speaker")}
        </button>
        <div class="word-slots">${slots}</div>
        ${feedback}
        <div class="keyboard">
          ${keyboardRows}
          <div class="key-row">
            <button class="key wide" data-action="erase" aria-label="Wis">
              ${icon("back")}
            </button>
          </div>
        </div>
      </section>`;
  }

  function dictationFinished() {
    // De app weet niet welke Genially-pagina na deze oefening komt.
    // De pijl is daarom een aanwijzing, geen link naar een onbekende pagina.
    app.innerHTML = `${header()}
      <section class="screen dictation-finished" aria-label="Dictee afgerond">
        <div class="finished-check" aria-hidden="true">${icon("check")}</div>
        <h1>Klaar!</h1>
        <div class="finished-next" aria-hidden="true">
          ${icon("next")}
        </div>
        <button class="restart-button" data-action="restart-dictation"
          aria-label="Oefening opnieuw doen" title="Oefening opnieuw doen">
          ${icon("retry")}
        </button>
      </section>`;
  }

  function booklet() {
    const groups = state.bookGroups;

    const parts = groups.map((group, index) => {
      const position = state.bookPositions[index] % group.length;
      return group[position];
    });

    const word = parts.join("");

    const columns = groups
      .map((group, index) => {
        const value = parts[index];

        return `<div class="book-col">
          <button class="tiny-btn" data-book="${index}" data-delta="-1" aria-label="Vorige">
            ${icon("up")}
          </button>
          <button class="sound-card" data-sound="${escapeHtml(value)}">
            ${escapeHtml(value)}
          </button>
          <button class="tiny-btn" data-book="${index}" data-delta="1" aria-label="Volgende">
            ${icon("down")}
          </button>
        </div>`;
      })
      .join("");

    app.innerHTML = `${header()}
      <section class="screen booklet">
        <div class="book-word">
          <button
            class="listen"
            data-sound="${escapeHtml(word)}"
            data-audio-key="word:${escapeHtml(word)}"
            aria-label="Luister"
          >${icon("speaker")}</button>
          <span>${escapeHtml(word)}</span>
        </div>
        <div class="book-columns">${columns}</div>
      </section>`;
  }
  function manualPanel() {
    const graphemes = tokenize(state.draftWord);
    const choices = graphemes
      .map(
        (grapheme, index) =>
          `<button class="chip missing-choice ${state.missingGraphemes.has(index) ? "active" : ""}" data-missing="${index}">${escapeHtml(grapheme)}</button>`,
      )
      .join("");

    const graphemePicker = graphemes.length
      ? `<p class="help">Tik op wat de cursist moet typen.</p>
         <div class="chips">${choices}</div>
         <p>
           <button class="action" data-action="add-manual">
             ${icon("plus")} Toevoegen
           </button>
         </p>`
      : "";

    return `<section class="panel">
      <h2>Zelf een dicteewoord toevoegen</h2>
      <div class="field">
        <label for="draft">Woord</label>
        <input
          id="draft"
          class="text-input"
          value="${escapeHtml(state.draftWord)}"
          autocomplete="off"
          autocapitalize="none"
        >
      </div>
      ${graphemePicker}
    </section>`;
  }

  function generatorPanel() {
    const availableWords = [
      ...new Set([...DATA.wordBank, ...state.customWords]),
    ]
      .filter(
        (word) =>
          patternOf(word) === state.pattern &&
          tokenize(word).every((grapheme) =>
            state.learnedGraphemes.has(grapheme),
          ),
      )
      .slice(0, 80);

    const suggestion =
      availableWords
        .map((word) => {
          const isAdded = state.questions.some(
            (question) => question.word === word,
          );

          return `<button
            class="suggestion ${isAdded ? "added" : ""}"
            data-suggest="${escapeHtml(word)}"
            ${isAdded ? "disabled" : ""}
          >
            ${isAdded ? icon("check") : icon("plus")}
            ${escapeHtml(word)}
          </button>`;
        })
        .join("") || `<div class="empty">Geen woorden met deze keuze.</div>`;

    const patternButtons = DATA.patterns
      .map(
        (pattern) =>
          `<button class="chip ${pattern === state.pattern ? "active" : ""}" data-pattern="${pattern}">${pattern}</button>`,
      )
      .join("");

    const graphemeButtons = DATA.learnable
      .map(
        (grapheme) =>
          `<button class="chip ${state.learnedGraphemes.has(grapheme) ? "active" : ""}" data-learned="${grapheme}">${grapheme}</button>`,
      )
      .join("");

    return `<section class="panel">
      <h2>Woorden uit de databank</h2>
      <div class="field">
        <label>Woordvorm</label>
        <div class="chips">${patternButtons}</div>
      </div>
      <div class="field">
        <label>Geleerde letters en klanken</label>
        <div class="chips">${graphemeButtons}</div>
      </div>
      <div class="suggestions">${suggestion}</div>
    </section>`;
  }
  function audioPanel() {
    const graphemes = [
      ...new Set(state.questions.flatMap((question) => question.graphemes)),
    ];

    const soundOptions = graphemes
      .map(
        (grapheme) =>
          `<option value="sound:${escapeHtml(grapheme)}">klank: ${escapeHtml(grapheme)}</option>`,
      )
      .join("");

    const wordOptions = state.questions
      .map(
        (question) =>
          `<option value="word:${escapeHtml(question.word)}">woord: ${escapeHtml(question.word)}</option>`,
      )
      .join("");

    return `<section class="panel">
      <h2>Eigen uitspraak</h2>
      <p class="help">Neem losse klanken of woorden op. Een eigen opname krijgt altijd voorrang.</p>
      <div class="field">
        <label for="audio-key">Klank of woord</label>
        <select id="audio-key" class="select">
          ${soundOptions}
          ${wordOptions}
        </select>
      </div>
      <p>
        <button class="action" data-action="record">${icon("mic")} Opnemen</button>
        <label class="action secondary">
          ${icon("upload")} Audio kiezen
          <input id="audio-file" type="file" accept="audio/*" hidden>
        </label>
      </p>
    </section>`;
  }
  function seriesPanel() {
    const list = state.questions
      .map(
        (question, index) =>
          `<div class="series-item">
            <span class="series-word">${escapeHtml(question.word)}</span>
            <span class="series-pattern">${patternOf(question.word)}</span>
            ${iconButton("close", `remove:${index}`, `Verwijder ${question.word}`)}
          </div>`,
      )
      .join("");

    return `<section class="panel">
      <h2>Huidige dicteereeks</h2>
      <div class="series">
        ${list || '<div class="empty">Nog geen woorden.</div>'}
      </div>
    </section>`;
  }

  function splitGraphemeList(value) {
    return value
      .toLowerCase()
      .split(",")
      .map((grapheme) => grapheme.trim())
      .filter(Boolean);
  }

  function publishPanel() {
    return `<section class="panel">
      <h2>Oefening klaarzetten</h2>
      <div class="field">
        <label for="exercise-name">Naam in de leerlijn</label>
        <input
          id="exercise-name"
          class="text-input"
          value="${escapeHtml(state.exerciseName)}"
          placeholder="bijvoorbeeld 1.3 – kip"
        >
      </div>
      <div class="publish-actions">
        <button class="action" data-action="save-dictation">
          ${icon("keyboard")} Dictee klaarzetten
        </button>
      </div>
    </section>`;
  }

  function clickBookPanel() {
    return `<section class="panel">
      <h2>Klik-klakboekje instellen</h2>
      <p class="help">Scheid letters en clusters met komma's.</p>
      <div class="field">
        <label for="book-begin">Vooraan</label>
        <input id="book-begin" class="text-input" value="${escapeHtml(state.clickBookDraft.begin)}">
      </div>
      <div class="field">
        <label for="book-kern">Midden</label>
        <input id="book-kern" class="text-input" value="${escapeHtml(state.clickBookDraft.kern)}">
      </div>
      <div class="field">
        <label for="book-einde">Achteraan</label>
        <input id="book-einde" class="text-input" value="${escapeHtml(state.clickBookDraft.einde)}">
      </div>
      <button class="action" data-action="save-clickbook">
        ${icon("book")} Klik-klakboekje klaarzetten
      </button>
    </section>`;
  }

  function savedExercisesPanel() {
    const exerciseList = state.exercises
      .map(
        (exercise) => `<div class="exercise-item">
          <div class="exercise-info">
            <strong>${escapeHtml(exercise.name)}</strong>
            <span>${exercise.type === "dictee" ? "Dictee" : "Klik-klak"}</span>
          </div>
          <a class="action secondary" href="${escapeHtml(exercise.url)}" target="_blank">Open</a>
          <button class="action secondary" data-copy-url="${escapeHtml(exercise.url)}">Kopieer link</button>
          <button class="icon-btn" data-delete-exercise="${exercise.id}" aria-label="Verwijder">
            ${icon("close")}
          </button>
        </div>`,
      )
      .join("");

    return `<section class="panel">
      <h2>Klaargezette oefeningen</h2>
      <div class="exercise-list">
        ${exerciseList || '<div class="empty">Nog geen aparte oefeningen.</div>'}
      </div>
    </section>`;
  }

  function manage() {
    app.innerHTML = `${header(false)}
      <main class="teacher">
        <h1>Instellingen voor de lesgever</h1>
        ${publishPanel()}
        ${manualPanel()}
        ${generatorPanel()}
        ${seriesPanel()}
        ${clickBookPanel()}
        ${savedExercisesPanel()}
        ${audioPanel()}
      </main>`;
  }
  function render() {
    const screens = {
      home: home,
      dictation: dictation,
      booklet: booklet,
      manage: manage,
    };

    const selectedScreen = screens[state.mode] || home;
    selectedScreen();
  }

  // ================================================================
  // 6. AUDIO OPNEMEN EN WOORDEN TOEVOEGEN
  // ================================================================

  async function record() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      alert("Opnemen wordt niet ondersteund in deze browser.");
      return;
    }
    if (state.recording) {
      state.recording.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const reader = new FileReader();
        reader.onload = () => {
          const key = document.querySelector("#audio-key")?.value;
          if (key) {
            state.audio[key] = reader.result;
            saveToStorage();
          }
          stream.getTracks().forEach((t) => t.stop());
          state.recording = null;
          manage();
        };
        reader.readAsDataURL(new Blob(chunks, { type: recorder.mimeType }));
      };
      recorder.start();
      state.recording = recorder;
      const b = document.querySelector('[data-action="record"]');
      if (b) b.innerHTML = `${icon("close")} Stop`;
    } catch {
      alert("De microfoon kon niet worden geopend.");
    }
  }
  function addWord(word, missing = null) {
    const graphemes = tokenize(word);
    if (!graphemes.length) return;
    const indexes = missing?.length ? missing : [...graphemes.keys()];
    if (!state.questions.some((q) => q.word === word))
      state.questions.push({ word, graphemes, missing: indexes });
    const isNewCustomWord =
      !DATA.wordBank.includes(word) && !state.customWords.includes(word);

    if (isNewCustomWord) {
      state.customWords.push(word);
    }

    saveToStorage();
  }

  function saveExercise(type) {
    const name = state.exerciseName.trim() || `Nieuwe ${type}`;
    let settings;

    if (type === "dictee") {
      settings = {
        type: "dictee",
        name: name,
        questions: state.questions,
      };
    } else {
      const groups = [
        splitGraphemeList(state.clickBookDraft.begin),
        splitGraphemeList(state.clickBookDraft.kern),
        splitGraphemeList(state.clickBookDraft.einde),
      ];

      if (groups.some((group) => group.length === 0)) {
        alert("Vul voor elke plaats minstens één letter of klank in.");
        return;
      }

      settings = {
        type: "klikklak",
        name: name,
        groups: groups,
      };
    }

    const url = makeExerciseUrl(type, settings);
    state.exercises.push({
      id: Date.now(),
      name: name,
      type: type,
      url: url,
    });

    state.exerciseName = "";
    saveToStorage();
    manage();
  }

  // ================================================================
  // 7. GEBEURTENISSEN: TYPEN, KIEZEN EN KLIKKEN
  // ================================================================

  app.addEventListener("input", (e) => {
    if (e.target.id === "draft") {
      // Onthoud waar de cursor stond voordat het scherm opnieuw wordt opgebouwd.
      // Zonder deze stap springt de cursor terug naar het begin en worden nieuwe
      // letters telkens vóór de bestaande tekst geplaatst.
      const cursorPosition = e.target.selectionStart ?? e.target.value.length;

      state.draftWord = e.target.value.toLowerCase();
      state.missingGraphemes.clear();
      manage();

      const refreshedInput = document.querySelector("#draft");
      refreshedInput?.focus();
      refreshedInput?.setSelectionRange(cursorPosition, cursorPosition);
    }

    if (e.target.id === "exercise-name") {
      state.exerciseName = e.target.value;
    }

    if (e.target.id === "book-begin") {
      state.clickBookDraft.begin = e.target.value;
    }

    if (e.target.id === "book-kern") {
      state.clickBookDraft.kern = e.target.value;
    }

    if (e.target.id === "book-einde") {
      state.clickBookDraft.einde = e.target.value;
    }
  });
  app.addEventListener("change", (e) => {
    if (e.target.id === "audio-file" && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        const key = document.querySelector("#audio-key")?.value;
        if (key) {
          state.audio[key] = reader.result;
          saveToStorage();
          manage();
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });
  app.addEventListener("click", (e) => {
    const target = e.target.closest(
      "button,[data-action],[data-sound],[data-key],[data-book],[data-missing],[data-pattern],[data-learned],[data-suggest],[data-copy-url],[data-delete-exercise]",
    );
    if (!target) return;

    if (target.dataset.copyUrl) {
      navigator.clipboard
        .writeText(target.dataset.copyUrl)
        .then(() => {
          target.textContent = "Gekopieerd";
        })
        .catch(() => {
          prompt("Kopieer deze link:", target.dataset.copyUrl);
        });
      return;
    }

    if (target.dataset.deleteExercise) {
      const id = Number(target.dataset.deleteExercise);
      state.exercises = state.exercises.filter(
        (exercise) => exercise.id !== id,
      );
      saveToStorage();
      manage();
      return;
    }
    if (target.dataset.key && !state.result) {
      state.typed += target.dataset.key;

      const expectedAnswer = getExpectedAnswer();
      const answerIsComplete = state.typed.length >= expectedAnswer.length;

      if (answerIsComplete) {
        const answerIsCorrect = state.typed === expectedAnswer;
        state.result = answerIsCorrect ? "good" : "wrong";
      }

      dictation();
      return;
    }
    if (target.dataset.sound) {
      speak(
        target.dataset.sound,
        target.dataset.audioKey || `sound:${target.dataset.sound}`,
      );
      return;
    }
    if (target.dataset.book !== undefined) {
      const columnIndex = Number(target.dataset.book);
      const groups = state.bookGroups;
      const group = groups[columnIndex];
      const direction = Number(target.dataset.delta);

      state.bookPositions[columnIndex] =
        (state.bookPositions[columnIndex] + direction + group.length) %
        group.length;

      booklet();
      return;
    }
    if (target.dataset.missing !== undefined) {
      const index = Number(target.dataset.missing);

      if (state.missingGraphemes.has(index)) {
        state.missingGraphemes.delete(index);
      } else {
        state.missingGraphemes.add(index);
      }

      manage();
      return;
    }
    if (target.dataset.pattern) {
      state.pattern = target.dataset.pattern;
      manage();
      return;
    }
    if (target.dataset.learned) {
      const grapheme = target.dataset.learned;

      if (state.learnedGraphemes.has(grapheme)) {
        state.learnedGraphemes.delete(grapheme);
      } else {
        state.learnedGraphemes.add(grapheme);
      }

      manage();
      return;
    }
    if (target.dataset.suggest) {
      addWord(target.dataset.suggest);
      manage();
      return;
    }
    const action = target.dataset.action;
    if (action === "home") {
      state.mode = "home";
      render();
    } else if (action === "manage") {
      state.mode = "manage";
      render();
    } else if (action === "dictation") {
      state.mode = "dictation";
      state.currentQuestionIndex = 0;
      state.typed = "";
      state.result = "";
      render();
    } else if (action === "booklet") {
      state.mode = "booklet";
      render();
    } else if (action === "speak-word") {
      const question = getCurrentQuestion();
      speak(question.word, `word:${question.word}`);
    } else if (action === "erase" && !state.result) {
      state.typed = state.typed.slice(0, -1);
      dictation();
    } else if (action === "retry") {
      state.typed = "";
      state.result = "";
      dictation();
    } else if (action === "next-question") {
      // Na het laatste woord tonen we een eindscherm in plaats van te herbeginnen.
      state.currentQuestionIndex += 1;
      state.typed = "";
      state.result = "";
      dictation();
    } else if (action === "restart-dictation") {
      state.currentQuestionIndex = 0;
      state.typed = "";
      state.result = "";
      dictation();
    } else if (action === "add-manual") {
      const wordIsFilledIn = Boolean(state.draftWord);
      const missingPartIsSelected = state.missingGraphemes.size > 0;

      if (wordIsFilledIn && missingPartIsSelected) {
        addWord(
          state.draftWord,
          [...state.missingGraphemes].sort((a, b) => a - b),
        );
        state.draftWord = "";
        state.missingGraphemes.clear();
        manage();
      }
    } else if (action?.startsWith("remove:")) {
      state.questions.splice(Number(action.split(":")[1]), 1);
      state.currentQuestionIndex = 0;
      saveToStorage();
      manage();
    } else if (action === "record") {
      record();
    } else if (action === "save-dictation") {
      saveExercise("dictee");
    } else if (action === "save-clickbook") {
      saveExercise("klikklak");
    }
  });

  // Start de app voor de eerste keer op.
  render();
})();
