import 'html-midi-player';
import { getVrvWorker } from './humdrum-notation-plugin-worker.js';
import { global_cursor } from './vhv-scripts/global-variables.js';

import * as Midi from '@tonaljs/midi';
window.Midi = Midi;

const player = document.getElementById('midi-player');
const loadMidiBtn = document.getElementById('load-midi');
const saveMidiBtn = document.getElementById('save-midi');

export function setMIDIPlayerCurrentTime(timeMS) {
  if (!player.playing) {
    let timeSec = timeMS / 1000 % player.duration;
    console.log('Time at cursor element', { timeSec, timeMS });
    player.currentTime = timeSec;
    player.offsetTime = timeSec;
  }
}

let vrvWorker = getVrvWorker();

let oldStartTime = -1;

player.addEventListener('note', async e => {
  if (e.detail.note.startTime > oldStartTime) {
    // console.log(JSON.stringify(e.detail.note, null, 2));
    await check(e.detail.note.startTime * 1000);
    oldStartTime = e.detail.note.startTime;
  }
})

player.addEventListener('stop', e => {
  player.currentTime = player?.offsetTime ?? 0;
  document.querySelectorAll('.harm, .note').forEach(elem => elem.classList.remove('highlight'));
})

window.player = player;

let ids = [];
async function check(time) {
  let elements = await vrvWorker.getElementsAtTime(time);
  // console.log('elements', elements)
  
  let noteElements = document.querySelectorAll(elements?.notes.map(id => '#' + id));
  // console.log('noteElements', noteElements)

  document.querySelectorAll('.harm, .note').forEach(elem => elem.classList.remove('highlight'));

  let firstNote = noteElements[0];
  let measure = firstNote?.closest('.measure');
  if (measure) {
    let harmony = measure.querySelector('.harm');
    if (harmony) {
      harmony.classList.add('highlight');
    }
  }

  if (firstNote) {
    global_cursor.CursorNote = firstNote;
    firstNote.classList.add('highlight');

    for (let i = 1; i < noteElements?.length; i++) {
      noteElements[i].classList.add('highlight');
    }
  }
}

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

// const proxy = new Proxy(player, {
//   set(target, prop, value) {
//     target[prop] = value;
//     if (prop === 'currentTime') {
//       console.log(prop, value);
//       vrvWorker.getElementsAtTime(proxy.currentTime).then(function (elements) {
//         console.log(elements)
//       });
//     }
//     return true;
//   },
//   get(target, prop, value) {
//     if (prop === "currentTime") {
//       console.log('CurrentTime value', value);
//       return value;
//     }
//     return Reflect.get(...arguments);
//   },
// })