/**
 * STAND-HF Changelog & Release Notes API Service
 * 
 * Replaces the former client-side popup dialog with a structured backend API integration.
 * The popup dialog is permanently suppressed/hidden from automatic UI display.
 * 
 * Endpoints:
 * - GET  /api/changelog : Fetches the current changelog and release notes
 * - POST /api/changelog : Submits/receives a list of content/changes when updates occur
 */
(function(window){
  'use strict';

  var API_URL = '/api/changelog';
  var FALLBACK_URL = '../data/whatsnew.json';

  var ChangelogAPI = {
    /**
     * Fetch the latest changelog from the backend API (or static fallback)
     * @returns {Promise<{ date: string, version: string, content: Array<{ cat: string, items: string[] }> }>}
     */
    getChangelog: async function() {
      try {
        var res = await fetch(API_URL);
        if (res.ok) {
          return await res.json();
        }
      } catch(e) {
        // Network or endpoint not yet deployed, fallback below
      }

      try {
        var fb = await fetch(FALLBACK_URL);
        if (fb.ok) {
          return await fb.json();
        }
      } catch(e) {
        console.warn('[ChangelogAPI] Unable to load fallback changelog:', e);
      }
      return null;
    },

    /**
     * Simple backend API receiver: receives a list of content/changes when updates occur
     * @param {Array<{ cat: string, items: string[] }>|Object} changes - The list of change content
     * @param {string} [version] - Optional version identifier
     * @returns {Promise<{ ok: boolean, status: number, data?: any, error?: string }>}
     */
    submitChanges: async function(changes, version) {
      var contentList = [];
      if (Array.isArray(changes)) {
        contentList = changes;
      } else if (changes && Array.isArray(changes.content)) {
        contentList = changes.content;
      } else if (changes && changes.cat && Array.isArray(changes.items)) {
        contentList = [changes];
      }

      var payload = {
        date: new Date().toISOString().slice(0, 10),
        version: version || ('v' + Date.now().toString(36)),
        content: contentList
      };

      try {
        var res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        var data = {};
        try { data = await res.json(); } catch(e){}

        return {
          ok: res.ok,
          status: res.status,
          data: data
        };
      } catch(err) {
        // In local static prototype mode where full backend is pending, log and return graceful status
        console.info('[ChangelogAPI] POST /api/changelog dispatched payload:', payload);
        return {
          ok: false,
          error: err.message,
          simulated: true,
          payload: payload
        };
      }
    }
  };

  window.STANDHF_CHANGELOG_API = ChangelogAPI;

  // Modal dialog is permanently hidden and suppressed on page load per specification.
})(window);
