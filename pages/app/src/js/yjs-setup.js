import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';
import { updateHandler } from './collaboration/collab-extension.js';
import { humdrumDataNoteIntoView } from './vhv-scripts/utility-ace.js';
import { markItem } from './vhv-scripts/utility-svg.js';
import { getAceEditor, insertSplashMusic } from './vhv-scripts/setup.js';
import AceBinding from './AceBinding.js';

export let yProvider;

const names = ['Michael', 'John', 'Jim', 'Maria', 'Nick', 'Jake', 'Isabella', 'Kate'];
const colors = [ '#30bced','#6eeb83','#ffbc42','#ecd444','#ee6352','#9ac2c9','#8acb88','#1be7ff'];

const oneOf = (array) => array[Math.floor(Math.random() * array.length)];

export let userData = {
  name: oneOf(names),
  color: oneOf(colors)
};

window.addEventListener('load', () => {
  const ydoc = new Y.Doc();
  
  let params = (new URL(document.location)).searchParams;
  let roomname = params.has('roomname') ? params.get('roomname') : 'ace-demo';
  if (typeof yProvider == 'undefined') {
    // yProvider = new WebsocketProvider('ws://localhost:3001', roomname, ydoc); // local
    // yProvider.on('status', event => {
    //   console.log(event.status) // websocket logs "connected" or "disconnected"
    // })

    yProvider = new WebrtcProvider(roomname, ydoc);
  }

  const type = ydoc.getText('ace');
  const yUndoManager = new Y.UndoManager(type);

  const editor = getAceEditor();
  if (!editor) {
    throw new Error('Ace Editor is undefined');
  }

  const binding = new AceBinding(type, editor, yProvider.awareness, {
    yUndoManager,
  });

  yProvider.awareness.setLocalStateField('user', userData);

  // Insert an initial song to the text editor
  insertSplashMusic();
  editor.renderer.setOption('maxLines', 50);

  editor.getSession().selection.on('changeCursor', function () {
    const { row, column } = editor.selection.getCursor();
    const item = humdrumDataNoteIntoView(row, column);
    // console.log('changeCursor event', { row, column, item })
    if (item) {
      markItem(item);
      const localState = yProvider.awareness.getLocalState();

      yProvider.awareness.setLocalState({
        ...localState,
        singleSelect: { elemId: item.id },
        multiSelect: null,
      });
    }
  });

  yProvider.awareness.on('update', updateHandler);

  window.example = { yProvider, ydoc, type };
});