/* Keeps every non-football/cricket homepage section header concise and factual. */
(function () {
  'use strict';

  var definitions = [
    { section: 'willow-live', status: 'willowStatus', empty: 'No events live' },
    { section: 'fancodeSection', status: 'fancodeStatus', empty: 'No events live' },
    { section: 'worldSportsSection', status: 'worldSportsStatus', empty: 'No events live' },
    { section: 'sonyLivSection', status: 'sonyLivStatus', empty: 'No events live' }
  ];

  function update(definition) {
    var section = document.getElementById(definition.section);
    var label = document.getElementById(definition.status);
    if (!section || !label) return;

    var cards = section.querySelectorAll('.md-card');
    if (!cards.length) {
      if (section.querySelector('.md-skeleton')) label.textContent = 'Loading events';
      else if (section.querySelector('.md-empty')) label.textContent = 'No events live';
      else if (section.querySelector('.md-error')) label.textContent = 'Schedule unavailable';
      return;
    }

    var live = section.querySelectorAll('.md-card.md-live').length;
    var upcoming = section.querySelectorAll('.md-card.md-upcoming').length;
    label.textContent = live ? live + (live === 1 ? ' event live' : ' events live') : upcoming ? upcoming + (upcoming === 1 ? ' upcoming event' : ' upcoming events') : definition.empty;
  }

  definitions.forEach(function (definition) {
    var section = document.getElementById(definition.section);
    if (!section || !window.MutationObserver) {
      update(definition);
      return;
    }
    new MutationObserver(function () { update(definition); }).observe(section, { childList: true, subtree: true });
    update(definition);
  });
})();
