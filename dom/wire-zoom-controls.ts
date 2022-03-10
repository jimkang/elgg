import { select } from 'd3-selection';

export function wireZoomControls({ onZoomCtrlChange }) {
  select('.near-button').on('click', onNearClick);
  select('.far-button').on('click', onFarClick);

  function onNearClick() {
    onZoomCtrlChange({ newScale: 1.0 });
  }

  function onFarClick() {
    onZoomCtrlChange({ newScale: 0.5 });
  }
}

