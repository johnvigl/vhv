import { assign, createMachine, interpret } from 'xstate';
import { updateHandler } from '../collaboration/collab-extension';
import { renderComments, uiCoords } from '../collaboration/templates';
import { displayNotation } from '../vhv-scripts/misc';
import { yProvider } from '../yjs-setup';
import { state as commentState } from './comments';

let inputElem = document.querySelector('#input');
let outputElem = document.querySelector('#output');
let outputWithCommentsElem = document.querySelector('.output-with-comments');

const replaceColValue = (elem, value) => {
  if (!elem) return;

  let oldValue = [...elem.classList].find((cl) => /^col/g.test(cl));
  let shouldRerender = false;
  if (oldValue) {
    let numeric = oldValue.match(/\d+/g);
    if (numeric && numeric != value) {
      shouldRerender = true;
    }

    elem.classList.remove(oldValue);
  }
  elem.classList.add(`col-${value}`);

  return shouldRerender;
};

const resize = (inputCol, outputCol, commentsCol) => {
  let commentsSection = document.querySelector('#comments-section');

  return () => {
    replaceColValue(inputElem, inputCol);
    let rerenderCol = replaceColValue(outputWithCommentsElem, outputCol + commentsCol - inputCol);
    let rerenderSVG = replaceColValue(outputElem, outputCol);
    replaceColValue(commentsSection, commentsCol);

    if (rerenderCol || rerenderSVG) {
      displayNotation();
      let output = document.querySelector('#output > svg');
      uiCoords.svgHeight = output?.height.baseVal.value ?? window.innerHeight;
    }
  };
};

const NONE = 0;
const SMALL = 2;
const SMALL_XL = 4;
const MID = 6;
const MID_XL = 8;
const LARGE = 10;
const LARGE_XL = 12;

export const layoutMachine = createMachine({
  initial: 'notationVisible',
  context: {
    inputCol: NONE,
    outputCol: LARGE_XL,
    commentsCol: NONE,
  },
  states: {
    idle: {
      id: 'idleState',
      on: {
        SHOW_NOTATION: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: LARGE_XL,
              commentsCol: NONE,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
      },
    },
    notationVisible: {
      on: {
        SHOW_TEXT: {
          target: 'notationAndTextVisible',
          actions: [
            assign({
              inputCol: SMALL_XL,
              outputCol: LARGE_XL,
              commentsCol: NONE,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
        SHOW_COMMENTS: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: MID_XL,
              commentsCol: SMALL_XL,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            }
          ],
        },
        SHOW_COMMENTS_HIDE_TEXT: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: MID_XL,
              commentsCol: SMALL_XL,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            }
          ],
        }
      },
    },
    notationAndTextVisible: {
      on: {
        SHOW_COMMENTS: {
          target: 'allVisible',
          actions: [
            assign({
              inputCol: SMALL,
              outputCol: LARGE,
              commentsCol: SMALL,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            }
          ],
        },
        HIDE_TEXT: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: LARGE_XL,
              commentsCol: NONE,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
        SHOW_COMMENTS_HIDE_TEXT: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: MID_XL,
              commentsCol: SMALL_XL,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            },
          ],
        }
      },
    },
    notationAndCommentsVisible: {
      on: {
        SHOW_TEXT: {
          target: 'allVisible',
          actions: [
            assign({
              inputCol: SMALL,
              outputCol: LARGE,
              commentsCol: SMALL,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)();
              renderComments(commentState.comments)
            },
          ],
        },
        HIDE_COMMENTS: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: LARGE_XL,
              commentsCol: NONE,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)()
              updateHandler({ updated: [...yProvider.awareness.getStates().keys()], added: [], removed: [] });
            },
          ],
        },
      },
    },
    allVisible: {
      on: {
        HIDE_TEXT: {
          target: 'notationAndCommentsVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: MID_XL,
              commentsCol: SMALL_XL,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
        HIDE_COMMENTS: {
          target: 'notationAndTextVisible',
          actions: [
            assign({
              inputCol: SMALL_XL,
              outputCol: LARGE_XL,
              commentsCol: NONE,
            }),
            ({ inputCol, outputCol, commentsCol }) => {
              resize(inputCol, outputCol, commentsCol)()
              updateHandler({ updated: [...yProvider.awareness.getStates().keys()], added: [], removed: [] });
            },
          ],
        },
        HIDE_ALL: {
          target: 'notationVisible',
          actions: [
            assign({
              inputCol: NONE,
              outputCol: LARGE_XL,
              commentsCol: NONE,
            }),
            ({ inputCol, outputCol, commentsCol }) =>
              resize(inputCol, outputCol, commentsCol)(),
          ],
        },
      },
    },
  },
});

export let layoutService = interpret(layoutMachine);
