const API_BASE_URL = "http://localhost:5000";

const yearEl = document.getElementById("year");
const propertySearchInput = document.getElementById("propertySearch");
const propertyTypeFilter = document.getElementById("propertyTypeFilter");
const propertySearchBtn = document.getElementById("propertySearchBtn");
const refreshPropertiesBtn = document.getElementById("refreshPropertiesBtn");
const propertyGrid = document.getElementById("propertyGrid");
const propertyStatus = document.getElementById("propertyStatus");
const propertyVisibleCount = document.getElementById("propertyVisibleCount");
const propertyTotalCount = document.getElementById("propertyTotalCount");
const backToTopBtn = document.getElementById("backToTopBtn");

let allProperties = [];

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const revealItems = document.querySelectorAll(".reveal-up");
if (revealItems.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (backToTopBtn) {
  const toggleBackToTop = () => {
    backToTopBtn.classList.toggle("is-visible", window.scrollY > 280);
  };

  toggleBackToTop();
  window.addEventListener("scroll", toggleBackToTop);
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const inferPropertyType = (title, location) => {
  const text = `${title || ""} ${location || ""}`.toLowerCase();
  if (text.includes("office") || text.includes("corporate")) return "office";
  if (text.includes("industrial") || text.includes("warehouse") || text.includes("logistics")) return "industrial";
  if (text.includes("retail") || text.includes("shop") || text.includes("mall")) return "retail";
  if (text.includes("land") || text.includes("plot")) return "land";
  return "mixed-use";
};

const getImageUrl = (imageName) => {
  if (!imageName) {
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";
  }
  if (imageName.startsWith("http")) return imageName;
  return `${API_BASE_URL}/uploads/${imageName}`;
};

const normalizeMapUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(url)}`;
};

const getDetailUrl = (propertyId) => `property.html?id=${encodeURIComponent(propertyId)}`;

const renderCards = (properties) => {
  if (!propertyGrid) return;

  if (properties.length === 0) {
    propertyGrid.innerHTML = "";
    if (propertyVisibleCount) propertyVisibleCount.textContent = "0";
    if (propertyTotalCount) propertyTotalCount.textContent = String(allProperties.length);
    if (propertyStatus) {
      propertyStatus.textContent = allProperties.length === 0 ? "No property found in backend." : "No matching properties.";
      propertyStatus.classList.remove("is-error");
      propertyStatus.classList.add("is-empty");
      propertyStatus.style.display = "block";
    }
    return;
  }

  if (propertyStatus) {
    propertyStatus.style.display = "none";
  }

  propertyGrid.innerHTML = properties
    .map((property) => {
      const title = property.title || "Untitled Property";
      const location = property.location || "Location unavailable";
      const storeName = property.storeName || "-";
      const description = property.description || "No description available.";
      const ownerContact = property.ownerContact ? String(property.ownerContact) : "";
      const googleLocation = normalizeMapUrl(property.googleLocation);
      const type = inferPropertyType(title, location);
      const propertyId = property._id || "";

      return `
        <div class="col-md-6 col-lg-4 property-item">
          <article class="property-card h-100 ${propertyId ? "map-enabled" : ""}" data-property-id="${propertyId}" data-map-url="${googleLocation}" data-title="${title.toLowerCase()}" data-location="${location.toLowerCase()}" data-store="${storeName.toLowerCase()}" data-type="${type}">
            <img src="${getImageUrl(property.image)}" alt="${title}" class="img-fluid rounded-4 mb-3" />
            <h5 class="fw-semibold">${title}</h5>
            <p class="text-muted mb-2">${location}</p>
            <p class="mb-1"><strong>Store:</strong> ${storeName}</p>
            <p class="mb-2">${description}</p>
            ${ownerContact ? `<p class="mb-1"><strong>Owner:</strong> ${ownerContact}</p>` : ""}
            <p class="fw-semibold mb-0">Rs ${Number(property.price || 0).toLocaleString("en-IN")}</p>
          </article>
        </div>
      `;
    })
    .join("");

  if (propertyVisibleCount) propertyVisibleCount.textContent = String(properties.length);
  if (propertyTotalCount) propertyTotalCount.textContent = String(allProperties.length);
};

const applyFilters = () => {
  const searchTerm = (propertySearchInput?.value || "").trim().toLowerCase();
  const selectedType = propertyTypeFilter?.value || "all";

  const filtered = allProperties.filter((property) => {
    const title = (property.title || "").toLowerCase();
    const location = (property.location || "").toLowerCase();
    const storeName = (property.storeName || "").toLowerCase();
    const type = inferPropertyType(property.title, property.location);

    const matchesSearch =
      searchTerm === "" || title.includes(searchTerm) || location.includes(searchTerm) || storeName.includes(searchTerm);
    const matchesType = selectedType === "all" || type === selectedType;
    return matchesSearch && matchesType;
  });

  renderCards(filtered);
};

const loadProperties = async () => {
  if (!propertyGrid) return;
  if (propertyStatus) {
    propertyStatus.textContent = "Loading properties from backend...";
    propertyStatus.classList.remove("is-error", "is-empty");
    propertyStatus.style.display = "block";
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`);
    if (!response.ok) throw new Error("Failed to fetch properties");
    const data = await response.json();
    allProperties = Array.isArray(data) ? data : [];
    applyFilters();
  } catch (error) {
    allProperties = [];
    propertyGrid.innerHTML = "";
    if (propertyStatus) {
      propertyStatus.textContent = "Unable to load properties. Start backend on http://localhost:5000.";
      propertyStatus.classList.add("is-error");
      propertyStatus.style.display = "block";
    }
    if (propertyVisibleCount) propertyVisibleCount.textContent = "0";
    if (propertyTotalCount) propertyTotalCount.textContent = "0";
  }
};

if (propertySearchBtn) propertySearchBtn.addEventListener("click", applyFilters);
if (propertyTypeFilter) propertyTypeFilter.addEventListener("change", applyFilters);
if (propertySearchInput) {
  propertySearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applyFilters();
    }
  });
}
if (refreshPropertiesBtn) refreshPropertiesBtn.addEventListener("click", loadProperties);

if (propertyGrid) {
  propertyGrid.addEventListener("click", (event) => {
    if (event.target.closest("a, button, input, select, textarea, label")) return;
    const card = event.target.closest(".property-card");
    if (!card) return;
    const propertyId = card.dataset.propertyId;
    if (!propertyId) return;
    window.location.href = getDetailUrl(propertyId);
  });
}

loadProperties();
