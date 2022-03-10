import 'html-midi-player';
import { getVrvWorker } from './humdrum-notation-plugin-worker.js';

const player = document.getElementById('midi-player');
const loadMidi = document.getElementById('load-midi');

let vrvWorker = getVrvWorker();

loadMidi.addEventListener('click', () => {
  if (!vrvWorker) {
    console.error('Could not load Verovio Worker');
    return;
  }
  
  vrvWorker
  .renderToMidi()
  .then((base64midi) => {
    let song = 'data:audio/midi;base64,' + base64midi;
    console.log('Midi song rendered by Verovio: ', song);
    player.src = song;
  })
  .catch((err) => console.log('Error when trying to play midi', err));
})

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