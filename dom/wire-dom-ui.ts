import { select } from 'd3-selection';

export function wireDOMUI({ onZoomCtrlChange, onPauseToggle }) {
  select('.near-button').on('click', onNearClick);
  select('.far-button').on('click', onFarClick);
  var pauseButton = select('.pause-button');
  pauseButton.on('click', onPauseClick);

  function onNearClick() {
    onZoomCtrlChange({ newScale: 1.0 });
  }

  function onFarClick() {
    onZoomCtrlChange({ newScale: 0.5 });
  }

  function onPauseClick() {
    pauseButton.node().classList.toggle('pause-on');
    onPauseToggle();
  }
}

