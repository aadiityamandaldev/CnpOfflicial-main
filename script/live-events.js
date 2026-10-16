/*
 * Football / Cricket home-page schedules
 *
 * This module intentionally reads only presentation-safe event fields:
 * title, status, category, teams, logos and start time. It does not use
 * stream arrays, player URLs or playback data.
 */
(function () {
  'use strict';

  var config = window.CNPTV_CONFIG || window.MATCHDEKHO_CONFIG || {};
  var apis = config.apis || {};
  var refreshEvery = Number(config.eventRefreshMs) || 300000;
  var sections = [
    {
      key: 'football',
      api: apis.football || '',
      trackId: 'footballTrack',
      countId: 'footballCount',
      previousId: 'footballPrevious',
      nextId: 'footballNext',
      label: 'Football'
    },
    {
      key: 'cricket',
      api: apis.cricket || '',
      trackId: 'cricketTrack',
      countId: 'cricketCount',
      previousId: 'cricketPrevious',
      nextId: 'cricketNext',
      label: 'Cricket'
    }
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeImageUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      var parsed = new URL(value.trim());
      return (parsed.protocol === 'https:' || parsed.protocol === 'http:') ? parsed.href : '';
    } catch (error) {
      return '';
    }
  }

  function initials(name) {
    return String(name || 'Team')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (word) { return word.charAt(0); })
      .join('')
      .toUpperCase() || 'TM';
  }

  function normaliseStatus(item) {
    var status = String(item && item.status || 'upcoming').toLowerCase().trim();
    if (status === 'live' || status === 'in play' || status === 'inplay') return 'live';
    if (status === 'ended' || status === 'finished' || status === 'completed') return 'ended';
    return 'upcoming';
  }

  function statusText(status) {
    if (status === 'live') return 'Live';
    if (status === 'ended') return 'Ended';
    return 'Upcoming';
  }

  function statusRank(item) {
    var status = normaliseStatus(item);
    return status === 'live' ? 0 : status === 'upcoming' ? 1 : 2;
  }

  function rawStartTime(item) {
    var event = item && item.event || {};
    return event.startTimeIST || event.startTimeUTC || item.startTime || item.start_time || '';
  }

  function startTimestamp(item) {
    var value = String(rawStartTime(item));
    var match = value.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    var parsed = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
    return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
  }

  function formatTime(value) {
    var text = String(value || '').trim();
    var match = text.match(/(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
    if (!match) return text ? text.replace(/\s+IST$/i, ' IST') : 'Time to be confirmed';

    var hour = Number(match[4]);
    var hour12 = hour % 12 || 12;
    var meridiem = hour >= 12 ? 'PM' : 'AM';
    return match[3] + '/' + match[2] + ' · ' + hour12 + ':' + match[5] + ' ' + meridiem + ' IST';
  }

  function extractEvents(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.events)) return payload.events;
    if (Array.isArray(payload.matches)) return payload.matches;
    if (payload.data && Array.isArray(payload.data.events)) return payload.data.events;
    return [];
  }

  function teamMarkup(name, imageUrl) {
    var safeName = escapeHtml(name);
    var image = imageUrl
      ? '<img src="' + escapeHtml(imageUrl) + '" alt="' + safeName + '" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-team-logo>'
      : '';

    return '' +
      '<div class="event-team">' +
        '<div class="event-team-logo' + (imageUrl ? '' : ' has-fallback') + '">' +
          image +
          '<span class="event-team-fallback">' + escapeHtml(initials(name)) + '</span>' +
        '</div>' +
        '<span class="event-team-name" title="' + safeName + '">' + safeName + '</span>' +
      '</div>';
  }

  function renderCard(item, sportLabel) {
    var event = item && item.event || {};
    var status = normaliseStatus(item);
    var eventName = event.name || item.title || sportLabel + ' Event';
    var category = event.category || sportLabel;
    var league = item.title || eventName;
    var teamA = event.teamA || 'Team A';
    var teamB = event.teamB || 'Team B';
    var imageA = safeImageUrl(event.teamAFlag || event.teamALogo || event.teamAImage || '');
    var imageB = safeImageUrl(event.teamBFlag || event.teamBLogo || event.teamBImage || '');
    var callToAction = status === 'live' ? 'Watch Live' : status === 'ended' ? 'Finished' : 'Watch Now';

    return '' +
      '<article class="event-match-card event-status-' + status + '">' +
        '<div class="event-match-visual">' +
          '<div class="event-match-topline">' +
            '<span class="event-sport-chip">' + escapeHtml(category) + '</span>' +
            '<span class="event-status-chip ' + status + '">' + escapeHtml(statusText(status)) + '</span>' +
          '</div>' +
          '<h3 class="event-match-name" title="' + escapeHtml(eventName) + '">' + escapeHtml(eventName) + '</h3>' +
          '<div class="event-teams-row">' +
            teamMarkup(teamA, imageA) +
            '<span class="event-versus" aria-hidden="true">VS</span>' +
            teamMarkup(teamB, imageB) +
          '</div>' +
        '</div>' +
        '<div class="event-match-info">' +
          '<p class="event-league" title="' + escapeHtml(league) + '">' + escapeHtml(league) + '</p>' +
          '<div class="event-match-footer">' +
            '<div class="event-meta"><span>' + escapeHtml(category) + '</span><time>' + escapeHtml(formatTime(rawStartTime(item))) + '</time></div>' +
            '<span class="event-watch-label ' + status + '"><span aria-hidden="true">&#9654;</span>' + escapeHtml(callToAction) + '</span>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function skeletonMarkup(count) {
    var output = '';
    for (var index = 0; index < count; index += 1) {
      output += '<div class="event-match-skeleton" aria-hidden="true"><span></span><span></span><span></span></div>';
    }
    return output;
  }

  function setImageFallbacks(track) {
    Array.prototype.forEach.call(track.querySelectorAll('[data-team-logo]'), function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.event-team-logo');
        if (holder) holder.classList.add('has-fallback');
      }, { once: true });
    });
  }

  function renderError(track, label, retry) {
    track.innerHTML = '<div class="event-feed-message"><div><strong>' + escapeHtml(label) + ' schedule is unavailable</strong><span>Please refresh or try again in a moment.</span><button type="button">Try again</button></div></div>';
    var button = track.querySelector('button');
    if (button) button.addEventListener('click', retry);
  }

  function renderEmpty(track, label) {
    track.innerHTML = '<div class="event-feed-message"><div><strong>No ' + escapeHtml(label.toLowerCase()) + ' events right now</strong><span>Please check again shortly.</span></div></div>';
  }

  function scrollByCards(track, direction) {
    var card = track.querySelector('.event-match-card, .event-match-skeleton');
    var cardWidth = card ? card.getBoundingClientRect().width : 300;
    var gap = parseFloat(window.getComputedStyle(track).gap || '16') || 16;
    track.scrollBy({ left: direction * (cardWidth + gap) * 2, behavior: 'smooth' });
  }

  function addDragScroll(track) {
    var active = false;
    var startX = 0;
    var initialScroll = 0;

    track.addEventListener('pointerdown', function (event) {
      active = true;
      startX = event.clientX;
      initialScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      if (track.setPointerCapture) track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', function (event) {
      if (!active) return;
      track.scrollLeft = initialScroll - (event.clientX - startX);
    });

    function stop() {
      active = false;
      track.classList.remove('is-dragging');
    }

    track.addEventListener('pointerup', stop);
    track.addEventListener('pointercancel', stop);
    track.addEventListener('pointerleave', function (event) {
      if (active && event.buttons === 0) stop();
    });
  }

  function mount(sectionInfo) {
    var track = document.getElementById(sectionInfo.trackId);
    var count = document.getElementById(sectionInfo.countId);
    var previous = document.getElementById(sectionInfo.previousId);
    var next = document.getElementById(sectionInfo.nextId);

    if (!track) return;
    track.innerHTML = skeletonMarkup(4);
    addDragScroll(track);

    if (previous) previous.addEventListener('click', function () { scrollByCards(track, -1); });
    if (next) next.addEventListener('click', function () { scrollByCards(track, 1); });

    function load() {
      if (!sectionInfo.api) {
        renderError(track, sectionInfo.label, load);
        if (count) count.textContent = 'Unavailable';
        return;
      }

      fetch(sectionInfo.api, { cache: 'no-store', headers: { Accept: 'application/json' } })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (payload) {
          var events = extractEvents(payload)
            .filter(function (item) { return item && typeof item === 'object'; })
            .sort(function (left, right) {
              return statusRank(left) - statusRank(right) || startTimestamp(left) - startTimestamp(right);
            });

          if (!events.length) {
            renderEmpty(track, sectionInfo.label);
            if (count) count.textContent = '0 events';
            return;
          }

          track.innerHTML = events.map(function (item) { return renderCard(item, sectionInfo.label); }).join('');
          if (count) count.textContent = events.length + (events.length === 1 ? ' event' : ' events');
          setImageFallbacks(track);
        })
        .catch(function (error) {
          if (window.console && console.warn) console.warn('[live-events] ' + sectionInfo.key + ' could not load', error);
          renderError(track, sectionInfo.label, load);
          if (count) count.textContent = 'Unavailable';
        });
    }

    load();
    window.setInterval(function () {
      if (!document.hidden) load();
    }, refreshEvery);
  }

  sections.forEach(mount);
})();
