/* ============================================
   Libertas - Civic Engagement Platform
   Main JavaScript
   ============================================ */

(function () {
  "use strict";

  /* ---- Constants ---- */
  var POLL_THRESHOLD = 20;
  var LS_DEMANDS = "libertas_demands";
  var LS_POLLS = "libertas_polls";
  var LS_PROFILE = "libertas_profile";
  var LS_VOTES = "libertas_votes";
  var LS_POLL_VOTES = "libertas_poll_votes";

  /* ---- State ---- */
  var state = {
    demands: [],
    polls: [],
    profile: {},
    votes: {},       // { demandId: "up" | "down" }
    pollVotes: {},   // { pollId: optionIndex }
    currentSection: "dashboard",
    demandSort: "recent",
    pollTab: "community"
  };

  /* ---- Seed Data ---- */
  function getDefaultDemands() {
    return [
      {
        id: "d1",
        title: "Install more bike racks near Chlodwigplatz",
        category: "Transportation",
        description: "There are not enough bike racks around the main square. Many bicycles are locked to fences and signs, blocking pedestrian paths.",
        upvotes: 24,
        downvotes: 3,
        author: "Anonymous Citizen",
        timestamp: Date.now() - 86400000 * 3
      },
      {
        id: "d2",
        title: "Improve lighting in Volksgarten park",
        category: "Safety",
        description: "The paths through Volksgarten are too dark at night. Better lighting would improve safety for everyone.",
        upvotes: 18,
        downvotes: 2,
        author: "Anonymous Citizen",
        timestamp: Date.now() - 86400000 * 5
      },
      {
        id: "d3",
        title: "More trash bins along the Rhine promenade",
        category: "Environment",
        description: "The Rhine promenade gets littered on weekends because there are too few trash bins. Adding more bins would keep the area cleaner.",
        upvotes: 31,
        downvotes: 1,
        author: "Anonymous Citizen",
        timestamp: Date.now() - 86400000 * 7
      },
      {
        id: "d4",
        title: "Open a community garden on Bonner Strasse",
        category: "Culture",
        description: "There is unused public land on Bonner Strasse that could serve as a community garden for residents.",
        upvotes: 12,
        downvotes: 4,
        author: "Anonymous Citizen",
        timestamp: Date.now() - 86400000 * 2
      },
      {
        id: "d5",
        title: "Reduce speed limit on Teutoburger Strasse",
        category: "Safety",
        description: "Cars drive too fast on this residential street. A 30 km/h zone would make it safer for families and children.",
        upvotes: 22,
        downvotes: 6,
        author: "Anonymous Citizen",
        timestamp: Date.now() - 86400000 * 1
      }
    ];
  }

  function getDefaultPolls() {
    return [
      {
        id: "p1",
        question: "Should the district invest in a new youth center?",
        description: "A proposal to build a modern youth center with sports facilities and study rooms.",
        category: "Education",
        type: "community",
        sponsor: null,
        options: ["Yes, prioritize this", "Yes, but not urgently", "No, other priorities first"],
        votes: [45, 22, 18]
      },
      {
        id: "p2",
        question: "Which improvement matters most for Severinstrasse?",
        description: "The city is allocating funds for one major improvement on Severinstrasse.",
        category: "Infrastructure",
        type: "community",
        sponsor: null,
        options: ["Wider sidewalks", "More greenery", "Better street lighting", "Noise reduction"],
        votes: [30, 25, 18, 12]
      },
      {
        id: "p3",
        question: "Do you support the proposed car-free Sundays in the district?",
        description: "A pilot program to close main streets to car traffic on the first Sunday of each month.",
        category: "Transportation",
        type: "community",
        sponsor: null,
        options: ["Strongly support", "Support with modifications", "Oppose"],
        votes: [55, 20, 15]
      },
      {
        id: "pc1",
        question: "How satisfied are you with public transport in Neustadt-Sued?",
        description: "KVB is evaluating service quality and frequency in your district.",
        category: "Transportation",
        type: "commissioned",
        sponsor: "KVB (Kolner Verkehrs-Betriebe)",
        options: ["Very satisfied", "Somewhat satisfied", "Neutral", "Dissatisfied"],
        votes: [10, 35, 25, 30]
      },
      {
        id: "pc2",
        question: "Would you use a neighborhood co-working space?",
        description: "A local real estate company is exploring demand for shared workspaces.",
        category: "Culture",
        type: "commissioned",
        sponsor: "Neustadt Immobilien GmbH",
        options: ["Yes, regularly", "Occasionally", "No"],
        votes: [28, 32, 15]
      }
    ];
  }

  function getDefaultProfile() {
    return {
      name: "",
      ageGroup: "30-44",
      gender: "Prefer not to say",
      district: "Neustadt-Sued"
    };
  }

  var trackerData = [
    {
      title: "Install more bike racks near Chlodwigplatz",
      status: 3,
      statusLabel: "In Planning",
      created: "2025-01-15",
      lastUpdate: "2025-03-28",
      responsible: "District Traffic Committee"
    },
    {
      title: "More trash bins along the Rhine promenade",
      status: 4,
      statusLabel: "Approved",
      created: "2024-11-02",
      lastUpdate: "2025-04-01",
      responsible: "AWB Cologne / District Council"
    },
    {
      title: "Improve lighting in Volksgarten park",
      status: 2,
      statusLabel: "Discussed",
      created: "2025-02-10",
      lastUpdate: "2025-03-15",
      responsible: "Parks and Safety Department"
    },
    {
      title: "Reduce speed limit on Teutoburger Strasse",
      status: 1,
      statusLabel: "No Reaction",
      created: "2025-03-20",
      lastUpdate: "-",
      responsible: "City Traffic Authority"
    },
    {
      title: "New youth center proposal",
      status: 5,
      statusLabel: "Implemented",
      created: "2024-06-01",
      lastUpdate: "2025-02-20",
      responsible: "Youth and Education Committee"
    }
  ];

  var statusLabels = ["", "No Reaction", "Discussed", "In Planning", "Approved", "Implemented"];

  /* ---- LocalStorage Helpers ---- */
  function loadState() {
    try {
      var d = localStorage.getItem(LS_DEMANDS);
      state.demands = d ? JSON.parse(d) : getDefaultDemands();

      var p = localStorage.getItem(LS_POLLS);
      state.polls = p ? JSON.parse(p) : getDefaultPolls();

      var pr = localStorage.getItem(LS_PROFILE);
      state.profile = pr ? JSON.parse(pr) : getDefaultProfile();

      var v = localStorage.getItem(LS_VOTES);
      state.votes = v ? JSON.parse(v) : {};

      var pv = localStorage.getItem(LS_POLL_VOTES);
      state.pollVotes = pv ? JSON.parse(pv) : {};
    } catch (e) {
      state.demands = getDefaultDemands();
      state.polls = getDefaultPolls();
      state.profile = getDefaultProfile();
      state.votes = {};
      state.pollVotes = {};
    }
  }

  function saveDemands() {
    localStorage.setItem(LS_DEMANDS, JSON.stringify(state.demands));
  }

  function savePolls() {
    localStorage.setItem(LS_POLLS, JSON.stringify(state.polls));
  }

  function saveProfile() {
    localStorage.setItem(LS_PROFILE, JSON.stringify(state.profile));
  }

  function saveVotes() {
    localStorage.setItem(LS_VOTES, JSON.stringify(state.votes));
  }

  function savePollVotes() {
    localStorage.setItem(LS_POLL_VOTES, JSON.stringify(state.pollVotes));
  }

  /* ---- Utility ---- */
  function generateId() {
    return "d" + Date.now() + Math.random().toString(36).substr(2, 5);
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return mins + " min ago";
    var hours = Math.floor(mins / 60);
    if (hours < 24) return hours + "h ago";
    var days = Math.floor(hours / 24);
    if (days < 30) return days + "d ago";
    return Math.floor(days / 30) + "mo ago";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---- Navigation ---- */
  function setupNav() {
    var links = document.querySelectorAll(".nav-link");
    var hamburger = document.getElementById("hamburger");
    var navLinks = document.getElementById("navLinks");

    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var section = this.getAttribute("data-section");
        switchSection(section);
        navLinks.classList.remove("open");
      });
    });

    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  function switchSection(name) {
    state.currentSection = name;
    document.querySelectorAll(".section").forEach(function (s) {
      s.classList.remove("active");
    });
    document.getElementById(name).classList.add("active");
    document.querySelectorAll(".nav-link").forEach(function (l) {
      l.classList.remove("active");
      if (l.getAttribute("data-section") === name) {
        l.classList.add("active");
      }
    });
    window.scrollTo(0, 0);
  }

  /* ---- Demands ---- */
  function renderDemands() {
    var list = document.getElementById("demandsList");
    var sorted = state.demands.slice();

    if (state.demandSort === "supported") {
      sorted.sort(function (a, b) {
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      });
    } else {
      sorted.sort(function (a, b) {
        return b.timestamp - a.timestamp;
      });
    }

    if (sorted.length === 0) {
      list.innerHTML = '<div class="card" style="text-align:center;color:var(--text-muted);">No demands yet. Be the first to post one!</div>';
      return;
    }

    var html = "";
    sorted.forEach(function (d) {
      var net = d.upvotes - d.downvotes;
      var isHot = d.upvotes >= POLL_THRESHOLD;
      var userVote = state.votes[d.id] || null;

      html += '<div class="card demand-card">';
      html += '<div class="demand-votes">';
      html += '<button class="btn-vote btn-upvote' + (userVote === "up" ? " voted" : "") + '" data-id="' + d.id + '" data-dir="up">&#9650; ' + d.upvotes + '</button>';
      html += '<span class="vote-count">' + net + '</span>';
      html += '<button class="btn-vote btn-downvote' + (userVote === "down" ? " voted" : "") + '" data-id="' + d.id + '" data-dir="down">&#9660; ' + d.downvotes + '</button>';
      html += '</div>';
      html += '<div class="demand-content">';
      html += '<h3>' + escapeHtml(d.title) + '</h3>';
      html += '<p class="demand-desc">' + escapeHtml(d.description) + '</p>';
      html += '<div class="demand-meta">';
      html += '<span class="badge">' + escapeHtml(d.category) + '</span>';
      if (isHot) {
        html += '<span class="badge badge-hot">Popular - Now a Poll</span>';
      }
      html += '<span class="feed-meta">' + escapeHtml(d.author) + ' - ' + timeAgo(d.timestamp) + '</span>';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    });

    list.innerHTML = html;
    attachDemandVoteListeners();
  }

  function attachDemandVoteListeners() {
    document.querySelectorAll(".btn-upvote, .btn-downvote").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = this.getAttribute("data-id");
        var dir = this.getAttribute("data-dir");
        voteDemand(id, dir);
      });
    });
  }

  function voteDemand(id, dir) {
    var demand = state.demands.find(function (d) { return d.id === id; });
    if (!demand) return;

    var prev = state.votes[id];

    // Undo previous vote
    if (prev === "up") demand.upvotes = Math.max(0, demand.upvotes - 1);
    if (prev === "down") demand.downvotes = Math.max(0, demand.downvotes - 1);

    if (prev === dir) {
      // Toggle off
      delete state.votes[id];
    } else {
      // Apply new vote
      state.votes[id] = dir;
      if (dir === "up") demand.upvotes++;
      if (dir === "down") demand.downvotes++;
    }

    saveDemands();
    saveVotes();
    checkDemandToPoll(demand);
    renderDemands();
  }

  function checkDemandToPoll(demand) {
    if (demand.upvotes < POLL_THRESHOLD) return;

    var existingPoll = state.polls.find(function (p) {
      return p.fromDemand === demand.id;
    });
    if (existingPoll) return;

    var newPoll = {
      id: "pauto_" + demand.id,
      question: demand.title + "?",
      description: demand.description,
      category: demand.category,
      type: "community",
      sponsor: null,
      fromDemand: demand.id,
      options: ["Yes, support this", "Support with changes", "No, oppose this"],
      votes: [0, 0, 0]
    };

    state.polls.push(newPoll);
    savePolls();
  }

  function setupDemandForm() {
    var form = document.getElementById("demandForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = document.getElementById("demandTitle").value.trim();
      var category = document.getElementById("demandCategory").value;
      var desc = document.getElementById("demandDesc").value.trim();

      if (!title || !desc) return;

      var demand = {
        id: generateId(),
        title: title,
        category: category,
        description: desc,
        upvotes: 0,
        downvotes: 0,
        author: "Anonymous Citizen",
        timestamp: Date.now()
      };

      state.demands.unshift(demand);
      saveDemands();
      renderDemands();
      form.reset();
    });

    document.getElementById("sortRecent").addEventListener("click", function () {
      state.demandSort = "recent";
      this.classList.add("active");
      document.getElementById("sortSupported").classList.remove("active");
      renderDemands();
    });

    document.getElementById("sortSupported").addEventListener("click", function () {
      state.demandSort = "supported";
      this.classList.add("active");
      document.getElementById("sortRecent").classList.remove("active");
      renderDemands();
    });
  }

  /* ---- Polls ---- */
  function renderPolls() {
    var list = document.getElementById("pollsList");
    var filtered = state.polls.filter(function (p) {
      return p.type === state.pollTab;
    });

    if (filtered.length === 0) {
      list.innerHTML = '<div class="card" style="text-align:center;color:var(--text-muted);">No polls in this category yet.</div>';
      return;
    }

    var html = "";
    filtered.forEach(function (poll) {
      var totalVotes = poll.votes.reduce(function (a, b) { return a + b; }, 0);
      var userVote = state.pollVotes[poll.id];
      var hasVoted = userVote !== undefined;

      html += '<div class="card poll-card">';
      html += '<div class="poll-header">';
      html += '<h3>' + escapeHtml(poll.question) + '</h3>';
      if (poll.type === "community") {
        html += '<span class="badge badge-community">Community</span>';
      } else {
        html += '<span class="badge badge-commissioned">Commissioned</span>';
      }
      html += '<span class="badge">' + escapeHtml(poll.category) + '</span>';
      if (poll.fromDemand) {
        html += '<span class="badge badge-gold">From Citizen Demand</span>';
      }
      html += '</div>';
      html += '<p>' + escapeHtml(poll.description) + '</p>';

      if (poll.sponsor) {
        html += '<div class="sponsor-label mt-sm">Sponsored by: ' + escapeHtml(poll.sponsor) + '</div>';
      }

      html += '<div class="poll-options">';
      poll.options.forEach(function (opt, i) {
        var pct = totalVotes > 0 ? Math.round((poll.votes[i] / totalVotes) * 100) : 0;
        var isSelected = userVote === i;
        html += '<div class="poll-option">';
        html += '<button class="poll-option-btn' + (isSelected ? " selected" : "") + '" data-poll="' + poll.id + '" data-opt="' + i + '">';
        html += '<div class="poll-bar-fill" style="width:' + (hasVoted ? pct : 0) + '%"></div>';
        html += '<span>' + escapeHtml(opt);
        if (hasVoted) {
          html += '<span class="poll-option-pct">' + pct + '%</span>';
        }
        html += '</span>';
        html += '</button>';
        html += '</div>';
      });
      html += '</div>';

      html += '<div class="poll-total">' + totalVotes + ' total votes</div>';

      if (poll.type === "commissioned") {
        html += '<div class="transparency-label">This poll was commissioned by an external organization. Results are public.</div>';
      }

      html += '</div>';
    });

    list.innerHTML = html;
    attachPollVoteListeners();
  }

  function attachPollVoteListeners() {
    document.querySelectorAll(".poll-option-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var pollId = this.getAttribute("data-poll");
        var optIdx = parseInt(this.getAttribute("data-opt"), 10);
        votePoll(pollId, optIdx);
      });
    });
  }

  function votePoll(pollId, optIdx) {
    var poll = state.polls.find(function (p) { return p.id === pollId; });
    if (!poll) return;

    var prev = state.pollVotes[pollId];

    if (prev !== undefined) {
      poll.votes[prev] = Math.max(0, poll.votes[prev] - 1);
    }

    if (prev === optIdx) {
      delete state.pollVotes[pollId];
    } else {
      state.pollVotes[pollId] = optIdx;
      poll.votes[optIdx]++;
    }

    savePolls();
    savePollVotes();
    renderPolls();
  }

  function setupPollTabs() {
    document.getElementById("tabCommunity").addEventListener("click", function () {
      state.pollTab = "community";
      this.classList.add("active");
      document.getElementById("tabCommissioned").classList.remove("active");
      renderPolls();
    });

    document.getElementById("tabCommissioned").addEventListener("click", function () {
      state.pollTab = "commissioned";
      this.classList.add("active");
      document.getElementById("tabCommunity").classList.remove("active");
      renderPolls();
    });
  }

  /* ---- Accountability ---- */
  function renderTracker() {
    var list = document.getElementById("trackerList");
    var html = "";

    trackerData.forEach(function (item) {
      html += '<div class="card tracker-card">';
      html += '<div class="tracker-header">';
      html += '<h3>' + escapeHtml(item.title) + '</h3>';
      var badgeClass = item.status >= 4 ? "badge-green" : (item.status <= 1 ? "badge-red" : "badge-primary");
      html += '<span class="badge ' + badgeClass + '">' + escapeHtml(item.statusLabel) + '</span>';
      html += '</div>';

      html += '<div class="tracker-meta">';
      html += '<div class="tracker-meta-item"><strong>Created:</strong> ' + item.created + '</div>';
      html += '<div class="tracker-meta-item"><strong>Last Update:</strong> ' + item.lastUpdate + '</div>';
      html += '<div class="tracker-meta-item"><strong>Responsible:</strong> ' + escapeHtml(item.responsible) + '</div>';
      html += '</div>';

      html += '<div class="progress-track">';
      for (var i = 1; i <= 5; i++) {
        var cls = i <= item.status ? (item.status === 5 ? "filled-gold" : "filled") : "";
        html += '<div class="progress-step ' + cls + '"></div>';
      }
      html += '</div>';

      html += '<div class="progress-labels">';
      for (var j = 1; j <= 5; j++) {
        var isCurrent = j === item.status;
        html += '<span class="progress-label-text' + (isCurrent ? " current" : "") + '">' + statusLabels[j] + '</span>';
      }
      html += '</div>';

      html += '</div>';
    });

    list.innerHTML = html;
  }

  /* ---- Profile ---- */
  function renderProfile() {
    var p = state.profile;
    document.getElementById("profileName").value = p.name || "";
    document.getElementById("profileAge").value = p.ageGroup || "30-44";
    document.getElementById("profileGender").value = p.gender || "Prefer not to say";
    document.getElementById("profileDistrict").value = p.district || "Neustadt-Sued";

    // Stats
    var demandsPosted = state.demands.filter(function (d) {
      return d.author === "Anonymous Citizen" && d.id.indexOf("d") === 0 && d.id.length > 3;
    }).length;
    var pollsVoted = Object.keys(state.pollVotes).length;
    var demandVotes = Object.keys(state.votes).length;

    var statsHtml = '';
    statsHtml += '<div class="stat-card"><span class="stat-card-number">' + demandsPosted + '</span><span class="stat-card-label">Demands Posted</span></div>';
    statsHtml += '<div class="stat-card"><span class="stat-card-number">' + demandVotes + '</span><span class="stat-card-label">Demand Votes Cast</span></div>';
    statsHtml += '<div class="stat-card"><span class="stat-card-number">' + pollsVoted + '</span><span class="stat-card-label">Polls Voted In</span></div>';

    var total = demandsPosted + demandVotes + pollsVoted;
    var badgeLabel = total >= 10 ? "Active Citizen" : (total >= 3 ? "Engaged Citizen" : "New Member");
    statsHtml += '<div class="engagement-badge">&#11088; ' + badgeLabel + '</div>';

    document.getElementById("profileStats").innerHTML = statsHtml;
  }

  function setupProfileForm() {
    var form = document.getElementById("profileForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      state.profile.name = document.getElementById("profileName").value.trim();
      state.profile.ageGroup = document.getElementById("profileAge").value;
      state.profile.gender = document.getElementById("profileGender").value;
      state.profile.district = document.getElementById("profileDistrict").value.trim();
      saveProfile();
      renderProfile();
      alert("Profile saved successfully.");
    });
  }

  /* ---- Initialize ---- */
  function init() {
    loadState();
    setupNav();
    setupDemandForm();
    setupPollTabs();
    setupProfileForm();
    renderDemands();
    renderPolls();
    renderTracker();
    renderProfile();
  }

  // Run on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
