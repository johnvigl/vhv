import 'html-midi-player';
import { getVrvWorker } from './humdrum-notation-plugin-worker.js';

const player = document.getElementById('midi-player');
const loadMidiBtn = document.getElementById('load-midi');
const saveMidiBtn = document.getElementById('save-midi');

let vrvWorker = getVrvWorker();

// Convert Humdrum to MIDI and load MIDI to player
loadMidiBtn.addEventListener('click', async () => {
  if (!vrvWorker) {
    console.error('Could not load Verovio Worker');
    return;
  }
  player.src = await toMidi();  
});

// Convert Humdrum to MIDI and prompt file download
saveMidiBtn.addEventListener('click', async () => {
  if (!vrvWorker) {
    console.error('Could not load Verovio Worker');
    return;
  }
  downloadFile(await toMidi(), `song-${new Date().toISOString()}`);
});

// Convert Humdrum editor content to MIDI (base64 encoded)
async function toMidi() {
  try {
    let base64midi = await vrvWorker.renderToMidi();
    let song = 'data:audio/midi;base64,' + base64midi;
    console.log('Midi song rendered by Verovio: ', song);
    return song;
  } catch(err) {
    console.log('Error when trying to play midi', err);
  }
}

function downloadFile(base64Song, fileName = '') {
  let element = document.createElement('a');
  element.setAttribute('href', base64Song);
  element.setAttribute('download', fileName + '.mid');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// For debugging
window.loadMidiSong = () => {
  if (!vrvWorker) {
    console.error('Could not load Verovio Worker');
    return;
  }

  vrvWorker
  .renderToMidi()
  .then((base64midi) => {
    console.log('Midi song rendered by Verovio: ', base64midi);
    var song = 'data:audio/midi;base64,' + base64midi;
    player.src = song;
  })
  .catch((err) => console.log('Error when trying to play midi', err));
}