## Προαπαιτούμενα
Πρέπει να είναι εγκατεστημένα:
- `node.js` ([download](https://nodejs.dev/download))
- `npm` (Κατεβαίνει μαζί με το `node.js`)

## Λήψη του project από το Github
- Αν υπάρχει το `git` εγκατεστημένο:
  ```sh
  git clone https://github.com/DimMilios/vite-scaffold.git
  ```
- Διαφορετικά πατώντας `Code>Download ZIP` στη σελίδα του project στο Github.

## Εγκατάσταση dependencies και development
Μετά τη λήψη των αρχείων του project:
  - Εγκατάσταση βιβλιοθηκών
    ```sh
    npm install
    ```
  - Εκκίνηση της εφαρμογής στο `http://localhost:3000`
    ```sh
    npm run dev
    ```

## Αρχεία που ενδιαφέρουν

### MIDI Player
- `/public/scripts/midiplayer`
- `/src/js/midifunctions.js`

### Verovio toolkit
- `/public/scripts/local/humdrumValidator.js`
- `/public/scripts/local/verovio-calls.js`
- `/public/scripts/local/verovio-toolkit-wasm.js`

### Αρχεία του Verovio Humdrum Viewer
- `/src/js/vhv-scripts/*`

### Ενσωμάτωση html-midi-player
- Εγκατάσταση του `html-midi-player` μέσω `npm`
  ```sh
  npm install --save html-midi-player
  ```
  - Αν δε δουλεύει μπορεί να φορτωθεί απομακρυσμένα με την προσθήκη του παρακάτω script στο αρχείο `index.html`.
    ```html
    <script src="https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.4.0"></script>
    ``` 

- Δημιουργία του script που ξεκινά το midi player: `src/js/html-midi.js`. Προσθέστε τα περιεχόμενα του αρχείου με το ίδιο όνομα που υπάρχει στο `github`.

- Τα παρακάτω εισάγονται στο `index.html`
  - Στο `<head>` element προστίθεται
    ```html
    <script type="module" src="/src/js/html-midi.js"></script>
    ```
  - Στο `<body>` element και μέσα στα elements που ακολουθούν (περίπου γραμμή 137)
    ```html
    <div class="topnav col-12 d-flex flex-column" id="topnav">
        <div>
            <div class="d-inline-flex w-100 ml-2 align-items-center"
                style="white-space:nowrap; overflow: hidden;">
    ```
    Προσθέστε αυτά εδώ:
    ```html
      <button id="load-midi" class="btn btn-primary" type="button">Render file to MIDI</button>
      <button id="save-midi" class="btn btn-primary" type="button">Export MIDI file</button>
      <midi-player id="midi-player" sound-font></midi-player>
    ```

    - Αφαιρέστε τον παλιό player που βρίσκεται στο ίδιο σημείο
      ```html
        <div xmlns="http://www.w3.org/1999/xhtml" class="nav-play-button mr-5">
      ```
- Documentation [URL](https://github.com/cifkao/html-midi-player)