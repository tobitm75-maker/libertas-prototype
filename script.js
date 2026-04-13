/* ============================
   Libertas - Application Logic
   ============================ */

(function () {
  "use strict";

  /* ---------- Constants ---------- */
  var POLL_THRESHOLD = 20;

  var STORAGE_KEYS = {
    demands: "libertas_demands",
    polls: "libertas_polls",
    profile: "libertas_profile",
    votes: "libertas_votes",
    pollVotes: "libertas_poll_votes"
  };

  /* ---------- Default Data ---------- */

  function getDefaultDemands() {
    return [
      {
        id: "d1",
        title: "Mehr Sitzbänke am Rheinufer",
        category: "Umwelt",
        description: "Am Rheinufer zwischen Südbrücke und Drehbrücke fehlen Sitzmöglichkeiten, besonders für ältere Menschen.",
        author: "Anonyme/r Bürger/in",
        timestamp: Date.now() - 86400000 * 3,
        upvotes: 24,
        downvotes: 2
      },
      {
        id: "d2",
        title: "Sicherere Radwege auf der Bonner Straße",
        category: "Verkehr",
        description: "Die Radwege auf der Bonner Straße sind zu schmal und schlecht markiert. Radfahrer fühlen sich unsicher.",
        author: "Anonyme/r Bürger/in",
        timestamp: Date.now() - 86400000 * 5,
        upvotes: 31,
        downvotes: 4
      },
      {
        id: "d3",
        title: "Längere Öffnungszeiten der Stadtbibliothek",
        category: "Bildung",
        description: "Die Stadtteilbibliothek schließt um 17 Uhr. Fuer Berufstätige und Studierende ist das zu frueh.",
        author: "Anonyme/r Bürger/in",
        timestamp: Date.now() - 86400000 * 1,
        upvotes: 15,
        downvotes: 1
      },
      {
        id: "d4",
        title: "Mehr Beleuchtung im Volksgarten",
        category: "Sicherheit",
        description: "Der Volksgarten ist abends schlecht beleuchtet. Besonders im Winter fühlen sich viele Anwohner unsicher.",
        author: "Anonyme/r Bürger/in",
        timestamp: Date.now() - 86400000 * 7,
        upvotes: 18,
        downvotes: 3
      },
      {
        id: "d5",
        title: "Grünflächen statt Parkplätze am Chlodwigplatz",
        category: "Umwelt",
        description: "Der Chlodwigplatz könnte lebenswerter werden, wenn einige Parkplätze in Grünflächen umgewandelt würden.",
        author: "Anonyme/r Bürger/in",
        timestamp: Date.now() - 86400000 * 2,
        upvotes: 12,
        downvotes: 6
      }
    ];
  }

  function getDefaultPolls() {
    return {
      community: [
        {
          id: "cp1",
          question: "Soll die Bonner Straße eine Fahrradstrasse werden?",
          description: "Basierend auf starker Bürgerunterstützung für sicherere Radwege.",
          category: "Verkehr",
          type: "community",
          fromDemand: "d2",
          options: [
            { label: "Ja, auf jeden Fall", votes: 48 },
            { label: "Nur teilweise umsetzen", votes: 22 },
            { label: "Nein, nicht nötig", votes: 8 }
          ],
          totalVotes: 78,
          demographics: {
            age: { "18-24": 14, "25-34": 28, "35-44": 18, "45-54": 10, "55-64": 5, "65+": 3 },
            gender: { "männlich": 42, "weiblich": 32, "divers": 4 },
            avgAge: 34
          }
        },
        {
          id: "cp2",
          question: "Sollen mehr Sitzbänke am Rheinufer aufgestellt werden?",
          description: "Vielfach gewünschte Verbesserung der Aufenthaltsqualität.",
          category: "Umwelt",
          type: "community",
          fromDemand: "d1",
          options: [
            { label: "Ja, deutlich mehr Bänke", votes: 35 },
            { label: "Nur an bestimmten Stellen", votes: 18 },
            { label: "Kein Bedarf", votes: 5 }
          ],
          totalVotes: 58,
          demographics: {
            age: { "18-24": 6, "25-34": 12, "35-44": 14, "45-54": 11, "55-64": 9, "65+": 6 },
            gender: { "männlich": 26, "weiblich": 28, "divers": 4 },
            avgAge: 43
          }
        },
        {
          id: "cp3",
          question: "Soll der Chlodwigplatz autofrei werden?",
          description: "Bürgerinitiative für eine Umgestaltung des Platzes als Begegnungszone.",
          category: "Verkehr",
          type: "community",
          fromDemand: null,
          options: [
            { label: "Ja, komplett autofrei", votes: 62 },
            { label: "Teilweise, nur Wochenenden", votes: 41 },
            { label: "Nein, Parkplätze behalten", votes: 19 }
          ],
          totalVotes: 122,
          demographics: {
            age: { "18-24": 22, "25-34": 35, "35-44": 28, "45-54": 18, "55-64": 12, "65+": 7 },
            gender: { "männlich": 58, "weiblich": 56, "divers": 8 },
            avgAge: 36
          }
        }
      ],
      commissioned: [
        {
          id: "co1",
          question: "Wie bewerten Sie die OEPNV-Anbindung in Neustadt-Süd?",
          description: "Beauftragt von den Kölner Verkehrs-Betrieben (KVB).",
          category: "Verkehr",
          type: "commissioned",
          sponsor: "Kölner Verkehrs-Betriebe (KVB)",
          options: [
            { label: "Sehr gut", votes: 12 },
            { label: "Gut", votes: 28 },
            { label: "Verbesserungswürdig", votes: 35 },
            { label: "Schlecht", votes: 10 }
          ],
          totalVotes: 85,
          demographics: {
            age: { "18-24": 10, "25-34": 20, "35-44": 18, "45-54": 16, "55-64": 12, "65+": 9 },
            gender: { "männlich": 40, "weiblich": 41, "divers": 4 },
            avgAge: 40
          }
        },
        {
          id: "co2",
          question: "Welche Freizeitangebote fehlen im Stadtteil?",
          description: "Beauftragt von der Stadt Köln, Amt für Stadtentwicklung.",
          category: "Kultur",
          type: "commissioned",
          sponsor: "Stadt Köln - Amt für Stadtentwicklung",
          options: [
            { label: "Sportanlagen", votes: 22 },
            { label: "Kulturveranstaltungen", votes: 30 },
            { label: "Spielplaetze", votes: 15 },
            { label: "Grünflächen", votes: 25 }
          ],
          totalVotes: 92,
          demographics: {
            age: { "18-24": 8, "25-34": 15, "35-44": 22, "45-54": 20, "55-64": 16, "65+": 11 },
            gender: { "männlich": 44, "weiblich": 43, "divers": 5 },
            avgAge: 44
          }
        }
      ]
    };
  }

  function getDefaultProfile() {
    return {
      name: "Max Mustermann",
      district: "Köln Neustadt-Süd",
      age: "25-34",
      gender: "männlich"
    };
  }

  function getDefaultTrackerItems() {
    return [
      {
        id: "t1",
        title: "Sicherere Radwege auf der Bonner Straße",
        status: "in_planning",
        statusLabel: "In Planung",
        created: "2026-01-15",
        lastUpdate: "2026-04-05",
        responsible: "Bezirksvertretung Innenstadt",
        stages: 3
      },
      {
        id: "t2",
        title: "Mehr Sitzbänke am Rheinufer",
        status: "discussed",
        statusLabel: "Diskutiert",
        created: "2026-02-10",
        lastUpdate: "2026-03-28",
        responsible: "Amt für Landschaftspflege",
        stages: 2
      },
      {
        id: "t3",
        title: "Beleuchtung im Volksgarten verbessern",
        status: "approved",
        statusLabel: "Genehmigt",
        created: "2025-11-20",
        lastUpdate: "2026-04-01",
        responsible: "RheinEnergie AG",
        stages: 4
      },
      {
        id: "t4",
        title: "Längere Bibliotheksöffnungszeiten",
        status: "none",
        statusLabel: "Keine Reaktion",
        created: "2026-03-01",
        lastUpdate: "-",
        responsible: "Stadtbibliothek Köln",
        stages: 1
      },
      {
        id: "t5",
        title: "Verkehrsberuhigung Alteburger Straße",
        status: "implemented",
        statusLabel: "Umgesetzt",
        created: "2025-08-12",
        lastUpdate: "2026-02-15",
        responsible: "Amt für Verkehrsmanagement",
        stages: 5
      }
    ];
  }

  /* ---------- State ---------- */

  var state = {
    demands: [],
    polls: { community: [], commissioned: [] },
    profile: {},
    votes: {},
    pollVotes: {},
    currentSection: "dashboard",
    demandSort: "recent"
  };

  /* ---------- Storage Helpers ---------- */

  function loadState() {
    try {
      var d = localStorage.getItem(STORAGE_KEYS.demands);
      state.demands = d ? JSON.parse(d) : getDefaultDemands();

      var p = localStorage.getItem(STORAGE_KEYS.polls);
      state.polls = p ? JSON.parse(p) : getDefaultPolls();

      var pr = localStorage.getItem(STORAGE_KEYS.profile);
      state.profile = pr ? JSON.parse(pr) : getDefaultProfile();

      var v = localStorage.getItem(STORAGE_KEYS.votes);
      state.votes = v ? JSON.parse(v) : {};

      var pv = localStorage.getItem(STORAGE_KEYS.pollVotes);
      state.pollVotes = pv ? JSON.parse(pv) : {};
    } catch (e) {
      state.demands = getDefaultDemands();
      state.polls = getDefaultPolls();
      state.profile = getDefaultProfile();
      state.votes = {};
      state.pollVotes = {};
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEYS.demands, JSON.stringify(state.demands));
    localStorage.setItem(STORAGE_KEYS.polls, JSON.stringify(state.polls));
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(state.profile));
    localStorage.setItem(STORAGE_KEYS.votes, JSON.stringify(state.votes));
    localStorage.setItem(STORAGE_KEYS.pollVotes, JSON.stringify(state.pollVotes));
  }

  /* ---------- Utility ---------- */

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return "Gerade eben";
    if (mins < 60) return "vor " + mins + " Min.";
    var hours = Math.floor(mins / 60);
    if (hours < 24) return "vor " + hours + " Std.";
    var days = Math.floor(hours / 24);
    if (days === 1) return "vor 1 Tag";
    return "vor " + days + " Tagen";
  }

  function generateId() {
    return "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
  }

  /* ---------- Navigation ---------- */

  function initNav() {
    var links = $$(".nav-link");
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var section = this.getAttribute("data-section");
        switchSection(section);
      });
    });

    var toggle = $("#nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        $("#nav-links").classList.toggle("open");
      });
    }
  }

  function switchSection(name) {
    state.currentSection = name;

    $$(".app-section").forEach(function (s) {
      s.classList.remove("active");
    });
    var target = document.getElementById(name);
    if (target) target.classList.add("active");

    $$(".nav-link").forEach(function (l) {
      l.classList.remove("active");
    });
    var activeLink = document.querySelector('.nav-link[data-section="' + name + '"]');
    if (activeLink) activeLink.classList.add("active");

    $("#nav-links").classList.remove("open");

    if (name === "demands") renderDemands();
    if (name === "polls") renderPolls();
    if (name === "representation") renderRepresentation();
    if (name === "politicians") renderPoliticians();
    if (name === "tracker") renderTracker();
    if (name === "profile") renderProfile();
  }

  /* ---------- Demands ---------- */

  function renderDemands() {
    var list = $("#demands-list");
    if (!list) return;

    var sorted = state.demands.slice();
    if (state.demandSort === "supported") {
      sorted.sort(function (a, b) { return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes); });
    } else {
      sorted.sort(function (a, b) { return b.timestamp - a.timestamp; });
    }

    if (sorted.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>Noch keine Forderungen eingereicht. Sei der/die Erste!</p></div>';
      return;
    }

    var html = "";
    sorted.forEach(function (d) {
      var isHot = d.upvotes >= POLL_THRESHOLD;
      var userVote = state.votes[d.id] || null;
      html += '<div class="card demand-card' + (isHot ? " demand-hot" : "") + '">';
      html += '<div class="demand-votes">';
      html += '<button class="btn btn-vote' + (userVote === "up" ? " upvoted" : "") + '" data-id="' + d.id + '" data-dir="up">&#9650; ' + d.upvotes + '</button>';
      html += '<button class="btn btn-vote' + (userVote === "down" ? " downvoted" : "") + '" data-id="' + d.id + '" data-dir="down">&#9660; ' + d.downvotes + '</button>';
      html += '</div>';
      html += '<div class="demand-body">';
      html += '<h4>' + d.title + '</h4>';
      html += '<p>' + d.description + '</p>';
      html += '<div class="demand-meta">';
      html += '<span class="badge badge-primary">' + d.category + '</span>';
      html += '<span>' + d.author + '</span>';
      html += '<span>' + timeAgo(d.timestamp) + '</span>';
      if (isHot) html += '<span class="badge badge-gold">Beliebte Forderung</span>';
      html += '</div></div></div>';
    });

    list.innerHTML = html;

    list.querySelectorAll(".btn-vote").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleVote(this.getAttribute("data-id"), this.getAttribute("data-dir"));
      });
    });
  }

  function handleVote(id, dir) {
    var demand = state.demands.find(function (d) { return d.id === id; });
    if (!demand) return;

    var prev = state.votes[id];

    if (prev === dir) {
      if (dir === "up") demand.upvotes--;
      else demand.downvotes--;
      delete state.votes[id];
    } else {
      if (prev === "up") demand.upvotes--;
      if (prev === "down") demand.downvotes--;
      if (dir === "up") demand.upvotes++;
      else demand.downvotes++;
      state.votes[id] = dir;
    }

    checkPollThreshold(demand);
    saveState();
    renderDemands();
  }

  function checkPollThreshold(demand) {
    if (demand.upvotes < POLL_THRESHOLD) return;
    var exists = state.polls.community.some(function (p) { return p.fromDemand === demand.id; });
    if (exists) return;

    var newPoll = {
      id: generateId(),
      question: demand.title + " - soll das umgesetzt werden?",
      description: "Automatisch erstellt, weil diese Forderung breite Unterstützung erhalten hat.",
      category: demand.category,
      type: "community",
      fromDemand: demand.id,
      options: [
        { label: "Ja, unbedingt", votes: 0 },
        { label: "Eher ja", votes: 0 },
        { label: "Eher nein", votes: 0 },
        { label: "Nein", votes: 0 }
      ],
      totalVotes: 0
    };

    state.polls.community.push(newPoll);
  }

  function initDemandForm() {
    var form = $("#demand-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = $("#demand-title").value.trim();
      var category = $("#demand-category").value;
      var description = $("#demand-description").value.trim();
      if (!title || !description) return;

      var newDemand = {
        id: generateId(),
        title: title,
        category: category,
        description: description,
        author: "Anonyme/r Bürger/in",
        timestamp: Date.now(),
        upvotes: 0,
        downvotes: 0
      };

      state.demands.unshift(newDemand);
      saveState();
      renderDemands();
      form.reset();
    });
  }

  function initSortButtons() {
    $$(".sort-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.demandSort = this.getAttribute("data-sort");
        $$(".sort-btn").forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");
        renderDemands();
      });
    });
  }

  /* ---------- Polls ---------- */

  function calcRepScore(demographics) {
    if (!demographics) return null;
    var totalParticipants = 0;
    Object.keys(demographics.age).forEach(function (k) { totalParticipants += demographics.age[k]; });
    if (totalParticipants === 0) return null;

    var ageScore = 0;
    Object.keys(REFERENCE_DATA.age).forEach(function (key) {
      var refPct = REFERENCE_DATA.age[key];
      var actPct = (demographics.age[key] || 0) / totalParticipants * 100;
      ageScore += Math.abs(refPct - actPct);
    });

    var genderTotal = 0;
    Object.keys(demographics.gender).forEach(function (k) { genderTotal += demographics.gender[k]; });
    var genderScore = 0;
    Object.keys(REFERENCE_DATA.gender).forEach(function (key) {
      var refPct = REFERENCE_DATA.gender[key];
      var actPct = genderTotal > 0 ? (demographics.gender[key] || 0) / genderTotal * 100 : 0;
      genderScore += Math.abs(refPct - actPct);
    });

    var deviation = (ageScore * 0.5 + genderScore * 0.5);
    var score = Math.max(0, Math.round(100 - deviation * 1.5));
    return score;
  }

  function getScoreClass(score) {
    if (score >= 70) return "score-high";
    if (score >= 45) return "score-medium";
    return "score-low";
  }

  function getScoreLabel(score) {
    if (score >= 70) return "Hoch";
    if (score >= 45) return "Mittel";
    return "Niedrig";
  }

  function renderPolls() {
    renderPollList("community", "#community-polls-list");
    renderPollList("commissioned", "#commissioned-polls-list");
  }

  function renderPollList(type, containerSel) {
    var container = $(containerSel);
    if (!container) return;

    var polls = state.polls[type] || [];

    if (polls.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Noch keine Abstimmungen in dieser Kategorie.</p></div>';
      return;
    }

    var html = "";
    polls.forEach(function (poll) {
      var repScore = calcRepScore(poll.demographics);

      html += '<div class="card">';
      html += '<div class="poll-card-header">';
      html += '<h4>' + poll.question + '</h4>';
      if (poll.type === "community") {
        html += '<span class="badge badge-primary">Bürgerabstimmung</span>';
      } else {
        html += '<span class="badge badge-commissioned">Auftragsumfrage</span>';
      }
      html += '</div>';
      if (poll.sponsor) {
        html += '<p class="poll-sponsor">Auftraggeber: ' + poll.sponsor + '</p>';
      }
      html += '<p class="poll-desc">' + poll.description + '</p>';
      html += '<div class="poll-options">';

      var userVote = state.pollVotes[poll.id];

      poll.options.forEach(function (opt, idx) {
        var pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
        var isVoted = userVote === idx;
        html += '<div class="poll-option' + (isVoted ? " voted" : "") + '" data-poll="' + poll.id + '" data-option="' + idx + '">';
        html += '<div class="poll-option-bar" style="width:' + pct + '%"></div>';
        html += '<div class="poll-option-content">';
        html += '<span>' + opt.label + '</span>';
        html += '<span>' + pct + '% (' + opt.votes + ')</span>';
        html += '</div></div>';
      });

      html += '</div>';
      html += '<div class="poll-meta">';
      html += '<span class="badge badge-gray">' + poll.category + '</span>';
      html += '<span>' + poll.totalVotes + ' Stimmen</span>';
      if (repScore !== null) {
        html += '<span class="poll-rep-badge ' + getScoreClass(repScore) + '" data-poll-detail="' + poll.id + '">&#9679; Rep.-Score: ' + repScore + '</span>';
      }
      if (poll.type === "commissioned") {
        html += '<span class="transparency-label">&#128270; Auftragsumfrage - Transparenzhinweis</span>';
      }
      html += '</div>';
      html += '<button class="detail-btn" data-poll-detail="' + poll.id + '">&#128202; Details &amp; Demografie</button>';
      html += '</div>';
    });

    container.innerHTML = html;

    container.querySelectorAll(".poll-option").forEach(function (opt) {
      opt.addEventListener("click", function () {
        handlePollVote(this.getAttribute("data-poll"), parseInt(this.getAttribute("data-option")));
      });
    });

    container.querySelectorAll("[data-poll-detail]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        showPollDetail(this.getAttribute("data-poll-detail"));
      });
    });
  }

  function showPollDetail(pollId) {
    var allPolls = state.polls.community.concat(state.polls.commissioned);
    var poll = allPolls.find(function (p) { return p.id === pollId; });
    if (!poll || !poll.demographics) return;

    var d = poll.demographics;
    var repScore = calcRepScore(d);
    var totalP = 0;
    Object.keys(d.age).forEach(function (k) { totalP += d.age[k]; });
    var genderTotal = 0;
    Object.keys(d.gender).forEach(function (k) { genderTotal += d.gender[k]; });

    var GENDER_LABELS = { "männlich": "Männlich", "weiblich": "Weiblich", "divers": "Divers" };

    var html = '<div class="modal-overlay visible" id="poll-detail-modal">';
    html += '<div class="modal-content">';
    html += '<button class="modal-close" id="modal-close-btn">&times;</button>';
    html += '<h3 class="modal-title">' + poll.question + '</h3>';
    html += '<p class="modal-subtitle">' + poll.description + '</p>';

    // Rep Score
    html += '<div class="poll-detail-score">';
    html += '<div class="poll-score-circle" style="background: conic-gradient(var(--primary) 0% ' + (repScore || 0) + '%, var(--gray-200) ' + (repScore || 0) + '% 100%)">';
    html += '<span class="poll-score-num">' + (repScore || "-") + '</span>';
    html += '<span class="poll-score-of">von 100</span>';
    html += '</div>';
    html += '<div class="poll-score-text">';
    html += '<strong>Repräsentativitäts-Score: ' + getScoreLabel(repScore) + '</strong>';
    html += '<span>Zeigt, wie gut die Teilnehmenden die Bevölkerung von Neustadt-Süd widerspiegeln.</span>';
    html += '</div></div>';

    // Key stats
    html += '<div class="modal-section">';
    html += '<h4>Teilnahme-Übersicht</h4>';
    html += '<div class="poll-stat-grid">';
    html += '<div class="poll-stat-box"><span class="stat-val">' + poll.totalVotes + '</span><span class="stat-lbl">Teilnehmer</span></div>';
    html += '<div class="poll-stat-box"><span class="stat-val">' + (d.avgAge || "-") + '</span><span class="stat-lbl">Durchschnittsalter</span></div>';
    html += '<div class="poll-stat-box"><span class="stat-val">' + poll.options.length + '</span><span class="stat-lbl">Antwortoptionen</span></div>';
    html += '</div></div>';

    // Gender
    html += '<div class="modal-section">';
    html += '<h4>Geschlechterverteilung</h4>';
    html += '<div class="comparison-bars">';
    html += '<div class="bar-legend"><span class="legend-actual">Teilnehmer</span><span class="legend-reference">Bevölkerung</span></div>';
    Object.keys(REFERENCE_DATA.gender).forEach(function (key) {
      var refPct = REFERENCE_DATA.gender[key];
      var actPct = genderTotal > 0 ? Math.round((d.gender[key] || 0) / genderTotal * 100) : 0;
      html += '<div class="bar-group">';
      html += '<label>' + GENDER_LABELS[key] + ' (' + actPct + '% vs. ' + refPct + '%)</label>';
      html += '<div class="bar-pair">';
      html += '<div class="bar-track"><div class="bar-fill actual" style="width:' + actPct + '%"></div></div>';
      html += '<div class="bar-track"><div class="bar-fill reference" style="width:' + refPct + '%"></div></div>';
      html += '</div></div>';
    });
    html += '</div></div>';

    // Age
    html += '<div class="modal-section">';
    html += '<h4>Altersverteilung</h4>';
    html += '<div class="comparison-bars">';
    html += '<div class="bar-legend"><span class="legend-actual">Teilnehmer</span><span class="legend-reference">Bevölkerung</span></div>';
    Object.keys(REFERENCE_DATA.age).forEach(function (key) {
      var refPct = REFERENCE_DATA.age[key];
      var actPct = totalP > 0 ? Math.round((d.age[key] || 0) / totalP * 100) : 0;
      html += '<div class="bar-group">';
      html += '<label>' + key + ' Jahre (' + actPct + '% vs. ' + refPct + '%)</label>';
      html += '<div class="bar-pair">';
      html += '<div class="bar-track"><div class="bar-fill actual" style="width:' + actPct + '%"></div></div>';
      html += '<div class="bar-track"><div class="bar-fill reference" style="width:' + refPct + '%"></div></div>';
      html += '</div></div>';
    });
    html += '</div></div>';

    html += '</div></div>';

    // Remove existing modal
    var existing = document.getElementById("poll-detail-modal");
    if (existing) existing.remove();

    document.body.insertAdjacentHTML("beforeend", html);

    document.getElementById("modal-close-btn").addEventListener("click", closePollModal);
    document.getElementById("poll-detail-modal").addEventListener("click", function (e) {
      if (e.target === this) closePollModal();
    });
  }

  function closePollModal() {
    var modal = document.getElementById("poll-detail-modal");
    if (modal) {
      modal.classList.remove("visible");
      setTimeout(function () { modal.remove(); }, 250);
    }
  }

  function handlePollVote(pollId, optionIdx) {
    var allPolls = state.polls.community.concat(state.polls.commissioned);
    var poll = allPolls.find(function (p) { return p.id === pollId; });
    if (!poll) return;

    var prev = state.pollVotes[pollId];

    if (prev !== undefined) {
      poll.options[prev].votes--;
      poll.totalVotes--;
    }

    if (prev === optionIdx) {
      delete state.pollVotes[pollId];
    } else {
      poll.options[optionIdx].votes++;
      poll.totalVotes++;
      state.pollVotes[pollId] = optionIdx;
    }

    saveState();
    renderPolls();
  }

  function initTabs() {
    $$(".tab-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = this.getAttribute("data-tab");
        $$(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
        this.classList.add("active");
        $$(".tab-content").forEach(function (c) { c.classList.remove("active"); });
        var target = document.getElementById("polls-" + tab);
        if (target) target.classList.add("active");
      });
    });
  }

  /* ---------- Representation ---------- */

  var REFERENCE_DATA = {
    age: {
      "18-24": 18,
      "25-34": 25,
      "35-44": 20,
      "45-54": 16,
      "55-64": 12,
      "65+": 9
    },
    gender: {
      "männlich": 48,
      "weiblich": 49,
      "divers": 3
    }
  };

  function renderRepresentation() {
    renderAgeBars();
    renderGenderBars();
  }

  function renderAgeBars() {
    var container = $("#age-bars");
    if (!container) return;

    var mockActual = { "18-24": 22, "25-34": 30, "35-44": 18, "45-54": 14, "55-64": 10, "65+": 6 };

    var html = '';
    html += '<div class="bar-legend"><span class="legend-actual">Teilnehmer</span><span class="legend-reference">Bevölkerung</span></div>';

    Object.keys(REFERENCE_DATA.age).forEach(function (key) {
      var ref = REFERENCE_DATA.age[key];
      var act = mockActual[key] || 0;
      html += '<div class="bar-group">';
      html += '<label>' + key + ' Jahre</label>';
      html += '<div class="bar-pair">';
      html += '<div class="bar-track"><div class="bar-fill actual" style="width:' + act + '%"></div></div>';
      html += '<div class="bar-track"><div class="bar-fill reference" style="width:' + ref + '%"></div></div>';
      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  function renderGenderBars() {
    var container = $("#gender-bars");
    if (!container) return;

    var GENDER_LABELS = {
      "männlich": "Männlich",
      "weiblich": "Weiblich",
      "divers": "Divers"
    };

    var mockActual = { "männlich": 52, "weiblich": 44, "divers": 4 };

    var html = '';
    html += '<div class="bar-legend"><span class="legend-actual">Teilnehmer</span><span class="legend-reference">Bevölkerung</span></div>';

    Object.keys(REFERENCE_DATA.gender).forEach(function (key) {
      var ref = REFERENCE_DATA.gender[key];
      var act = mockActual[key] || 0;
      html += '<div class="bar-group">';
      html += '<label>' + GENDER_LABELS[key] + '</label>';
      html += '<div class="bar-pair">';
      html += '<div class="bar-track"><div class="bar-fill actual" style="width:' + act + '%"></div></div>';
      html += '<div class="bar-track"><div class="bar-fill reference" style="width:' + ref + '%"></div></div>';
      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  /* ---------- Politicians ---------- */

  function renderPoliticians() {
    renderParties();
    renderPoliticianCards();
  }

  function renderParties() {
    var container = $("#parties-list");
    if (!container) return;

    var parties = [
      { name: "CDU", logo: "&#9899;", desc: "Christdemokratische Fraktion im Bezirksrat" },
      { name: "Bündnis 90/Die Grünen", logo: "&#127807;", desc: "Grüne Fraktion im Bezirksrat" },
      { name: "SPD", logo: "&#128308;", desc: "Sozialdemokratische Fraktion im Bezirksrat" },
      { name: "FDP", logo: "&#128311;", desc: "Liberale Fraktion im Bezirksrat" },
      { name: "Die Linke", logo: "&#128996;", desc: "Linke Fraktion im Bezirksrat" },
      { name: "Volt", logo: "&#128995;", desc: "Europaeische progressive Partei" }
    ];

    var html = "";
    parties.forEach(function (p) {
      html += '<div class="card party-card">';
      html += '<div class="party-logo">' + p.logo + '</div>';
      html += '<h4>' + p.name + '</h4>';
      html += '<p>' + p.desc + '</p>';
      html += '</div>';
    });

    container.innerHTML = html;
  }

  function renderPoliticianCards() {
    var container = $("#politicians-list");
    if (!container) return;

    var politicians = [
      {
        name: "Dr. Maria Schneider",
        role: "Bezirksbürgermeisterin",
        initials: "MS",
        bio: "Seit 2020 Bezirksbürgermeisterin. Schwerpunkte: Stadtentwicklung, Bürgerbeteiligung und Nachhaltigkeit.",
        priorities: ["Bürgerbeteiligung", "Nachhaltigkeit", "Bildung"],
        focus: "Neugestaltung des Chlodwigplatzes als verkehrsberuhigte Zone",
        question: "Welche Verbesserungen wünschen Sie sich für den öffentlichen Nahverkehr in Neustadt-Süd?",
        statement: "Wir müssen Bürgerbeteiligung auf Stadtteilebene ernst nehmen. Libertas ist ein vielversprechendes Werkzeug."
      },
      {
        name: "Thomas Weber",
        role: "Vorsitzender Bezirksrat",
        initials: "TW",
        bio: "Langjähriges Engagement in der Kommunalpolitik. Setzt sich für transparente Entscheidungsprozesse ein.",
        priorities: ["Transparenz", "Verkehr", "Sicherheit"],
        focus: "Verbesserung der Radinfrastruktur entlang der Bonner Straße",
        question: null,
        statement: null
      }
    ];

    var html = "";
    politicians.forEach(function (pol) {
      html += '<div class="card politician-card">';
      html += '<div class="politician-header">';
      html += '<div class="politician-avatar">' + pol.initials + '</div>';
      html += '<div class="politician-info"><h4>' + pol.name + '</h4><p>' + pol.role + '</p></div>';
      html += '</div>';
      html += '<p class="politician-bio">' + pol.bio + '</p>';
      html += '<div class="politician-priorities">';
      pol.priorities.forEach(function (pr) {
        html += '<span class="badge badge-primary">' + pr + '</span>';
      });
      html += '</div>';
      if (pol.focus) {
        html += '<div class="politician-section"><h5>Aktueller Schwerpunkt</h5><p>' + pol.focus + '</p></div>';
      }
      if (pol.question) {
        html += '<div class="politician-section"><h5>Offene Frage an die Bürger*innen</h5><p>' + pol.question + '</p></div>';
      }
      if (pol.statement) {
        html += '<div class="politician-section"><h5>Aktuelles Statement</h5><p>"' + pol.statement + '"</p></div>';
      }
      html += '<button class="btn btn-follow">Folgen</button>';
      html += '</div>';
    });

    container.innerHTML = html;
  }

  /* ---------- Tracker ---------- */

  function renderTracker() {
    var container = $("#tracker-list");
    if (!container) return;

    var items = getDefaultTrackerItems();

    var STATUS_BADGES = {
      "none": "badge-gray",
      "discussed": "badge-warning",
      "in_planning": "badge-primary",
      "approved": "badge-primary",
      "implemented": "badge-success"
    };

    var STATUS_CSS = {
      "none": "status-none",
      "discussed": "status-discussed",
      "in_planning": "status-planning",
      "approved": "status-approved",
      "implemented": "status-implemented"
    };

    var TOTAL_STAGES = 5;

    var html = "";
    items.forEach(function (item) {
      html += '<div class="card tracker-card ' + (STATUS_CSS[item.status] || "") + '">';
      html += '<div class="tracker-header">';
      html += '<h4>' + item.title + '</h4>';
      html += '<span class="badge ' + (STATUS_BADGES[item.status] || "badge-gray") + '">' + item.statusLabel + '</span>';
      html += '</div>';
      html += '<div class="progress-stages">';
      for (var i = 1; i <= TOTAL_STAGES; i++) {
        var cls = "stage";
        if (i < item.stages) cls += " completed";
        else if (i === item.stages) cls += " current";
        html += '<div class="' + cls + '"></div>';
      }
      html += '</div>';
      html += '<dl class="tracker-details">';
      html += '<dt>Erstellt</dt><dd>' + item.created + '</dd>';
      html += '<dt>Letztes Update</dt><dd>' + item.lastUpdate + '</dd>';
      html += '<dt>Status</dt><dd>' + item.statusLabel + '</dd>';
      html += '<dt>Zuständig</dt><dd>' + item.responsible + '</dd>';
      html += '</dl></div>';
    });

    container.innerHTML = html;
  }

  /* ---------- Profile ---------- */

  function renderProfile() {
    var p = state.profile;
    $("#profile-name").value = p.name || "";
    $("#profile-district").value = p.district || "Köln Neustadt-Süd";
    $("#profile-age").value = p.age || "25-34";
    $("#profile-gender").value = p.gender || "männlich";

    renderParticipationStats();
  }

  function renderParticipationStats() {
    var container = $("#participation-stats");
    if (!container) return;

    var demandCount = state.demands.filter(function (d) {
      return d.author === "Anonyme/r Bürger/in" && d.timestamp > Date.now() - 86400000 * 30;
    }).length;

    var voteCount = Object.keys(state.votes).length + Object.keys(state.pollVotes).length;

    html = '';
    html += '<div class="stat-item"><div class="stat-value">' + state.demands.length + '</div><div class="stat-label">Forderungen</div></div>';
    html += '<div class="stat-item"><div class="stat-value">' + voteCount + '</div><div class="stat-label">Abgegebene Stimmen</div></div>';
    html += '<div class="stat-item"><div class="stat-value">' + state.polls.community.length + '</div><div class="stat-label">Bürgerabstimmungen</div></div>';
    html += '<div class="stat-item"><div class="stat-value">' + (state.profile.name ? "Aktiv" : "-") + '</div><div class="stat-label">Status</div></div>';

    container.innerHTML = html;
  }

  function initProfileForm() {
    var form = $("#profile-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      state.profile.name = $("#profile-name").value.trim();
      state.profile.district = $("#profile-district").value.trim();
      state.profile.age = $("#profile-age").value;
      state.profile.gender = $("#profile-gender").value;
      saveState();
      renderProfile();
      alert("Profil erfolgreich gespeichert!");
    });
  }

  /* ---------- Init ---------- */

  function init() {
    loadState();
    initNav();
    initDemandForm();
    initSortButtons();
    initTabs();
    initProfileForm();
    renderDemands();
    renderPolls();
    renderRepresentation();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
