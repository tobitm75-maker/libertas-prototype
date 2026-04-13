// ====== INITIAL DATA ======

const DEFAULT_DEMANDS = [
  {
    id: Date.now(),
    title: "Mehr Fahrradwege in Neustadt-Sued",
    category: "Verkehr",
    description: "Es sollten mehr sichere Fahrradwege im Stadtteil gebaut werden.",
    upvotes: 12,
    downvotes: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 1,
    title: "Sichere Schulwege verbessern",
    category: "Sicherheit",
    description: "Mehr Zebrastreifen und Verkehrsberuhigung rund um Schulen.",
    upvotes: 18,
    downvotes: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: Date.now() + 2,
    title: "Mehr Gruenflaechen schaffen",
    category: "Umwelt",
    description: "Freie Flaechen sollten fuer Parks und Gruenflaechen genutzt werden.",
    upvotes: 9,
    downvotes: 3,
    createdAt: new Date().toISOString()
  }
];

// ====== STORAGE ======

function getDemands() {
  const data = localStorage.getItem("demands");
  if (!data) {
    localStorage.setItem("demands", JSON.stringify(DEFAULT_DEMANDS));
    return DEFAULT_DEMANDS;
  }
  return JSON.parse(data);
}

function saveDemands(demands) {
  localStorage.setItem("demands", JSON.stringify(demands));
}

// ====== RENDER ======

function renderDemands() {
  const container = document.getElementById("demandsList");
  if (!container) return;

  const demands = getDemands();

  container.innerHTML = "";

  demands.forEach(demand => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${demand.title}</h3>
      <p>${demand.description}</p>
      <p class="card-meta">Kategorie: ${demand.category}</p>
      <div class="vote-bar">
        <button onclick="vote(${demand.id}, 'up')">👍 ${demand.upvotes}</button>
        <button onclick="vote(${demand.id}, 'down')">👎 ${demand.downvotes}</button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ====== VOTING ======

function vote(id, type) {
  const demands = getDemands();

  const updated = demands.map(d => {
    if (d.id === id) {
      if (type === "up") d.upvotes++;
      if (type === "down") d.downvotes++;
    }
    return d;
  });

  saveDemands(updated);
  renderDemands();
}

// ====== FORM ======

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("demandForm");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const title = document.getElementById("demandTitle").value;
      const category = document.getElementById("demandCategory").value;
      const description = document.getElementById("demandDesc").value;

      const newDemand = {
        id: Date.now(),
        title,
        category,
        description,
        upvotes: 0,
        downvotes: 0,
        createdAt: new Date().toISOString()
      };

      const demands = getDemands();
      demands.unshift(newDemand);

      saveDemands(demands);
      renderDemands();

      form.reset();
    });
  }

  renderDemands();
});
