const navbar = document.querySelector(".site-navbar");
const yearEl = document.getElementById("year");
const forms = [document.getElementById("heroForm"), document.getElementById("contactForm")];
const API_BASE_URL = "http://localhost:5000";

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const updateNavbarState = () => {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 20);
};

updateNavbarState();
window.addEventListener("scroll", updateNavbarState);

forms.forEach((form) => {
  if (!form) return;
  form.addEventListener("submit", (event) => {
    const isValid = form.checkValidity();
    if (!isValid) {
      event.preventDefault();
      form.classList.add("was-validated");
      return;
    }

    const button = form.querySelector("button[type='submit']");
    const originalText = button.textContent;
    button.textContent = form.dataset.mailSubmit === "true" ? "Sending..." : "Submitted";
    button.disabled = true;

    if (form.dataset.mailSubmit === "true") {
      return;
    }

    event.preventDefault();
    setTimeout(() => {
      form.reset();
      form.classList.remove("was-validated");
      button.textContent = originalText;
      button.disabled = false;
    }, 1200);
  });
});

const realEstateCard = document.getElementById("realEstatePropertyCard");
const realEstateActions = document.getElementById("realEstatePropertyActions");

if (realEstateCard && realEstateActions) {
  const toggleActions = () => {
    const willShow = !realEstateActions.classList.contains("is-visible");
    realEstateActions.classList.toggle("is-visible", willShow);
    realEstateActions.setAttribute("aria-hidden", String(!willShow));
  };

  realEstateCard.addEventListener("click", (event) => {
    if (event.target.closest("a, button")) return;
    toggleActions();
  });

  const locationBtn = realEstateCard.querySelector(".see-location-btn");
  if (locationBtn) {
    const url = new URL(locationBtn.href);
    if (!url.searchParams.has("t")) {
      url.searchParams.set("t", "k");
      locationBtn.href = url.toString();
    }
  }
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

const backToTopBtn = document.getElementById("backToTopBtn");
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

const propertySearchInput = document.getElementById("propertySearch");
const propertyTypeFilter = document.getElementById("propertyTypeFilter");
const propertySearchBtn = document.getElementById("propertySearchBtn");
const propertyFilterBtn = document.getElementById("propertyFilterBtn");
const propertyGrid = document.getElementById("propertyGrid");
const propertyStatus = document.getElementById("propertyStatus");
const propertyVisibleCount = document.getElementById("propertyVisibleCount");
const propertyTotalCount = document.getElementById("propertyTotalCount");
const featuredPropertyGrid = document.getElementById("featuredPropertyGrid");
const featuredPropertyStatus = document.getElementById("featuredPropertyStatus");

const getTypeLabel = (value) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const inferPropertyType = (title, location) => {
  const text = `${title || ""} ${location || ""}`.toLowerCase();
  if (text.includes("office") || text.includes("corporate")) return "office";
  if (text.includes("industrial") || text.includes("warehouse") || text.includes("logistics")) return "industrial";
  if (text.includes("retail") || text.includes("mall") || text.includes("shop")) return "retail";
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

const renderProperties = (properties) => {
  if (!propertyGrid) return;

  propertyGrid.innerHTML = properties
    .map((property) => {
      const type = inferPropertyType(property.title, property.location);
      const safeTitle = property.title || "Untitled Property";
      const safeLocation = property.location || "Location unavailable";
      const safeDescription = property.description || "No description available.";
      const ownerContact = property.ownerContact ? String(property.ownerContact) : "";
      const googleLocation = normalizeMapUrl(property.googleLocation);
      const imageUrl = getImageUrl(property.image);
      const propertyId = property._id || "";

      return `
        <div class="col-md-6 col-lg-4 reveal-up property-item" data-title="${safeTitle}" data-location="${safeLocation}" data-type="${type}">
          <article class="property-card h-100 ${propertyId ? "map-enabled" : ""}" data-property-id="${propertyId}" data-map-url="${googleLocation}">
            <img src="${imageUrl}" alt="${safeTitle}" class="img-fluid rounded-4 mb-3" />
            <h5 class="fw-semibold">${safeTitle}</h5>
            <p class="text-muted mb-2">${safeLocation}</p>
            <p class="mb-1"><strong>Store:</strong> ${property.storeName || "-"}</p>
            <p class="mb-1">${safeDescription}</p>
            ${ownerContact ? `<p class="mb-1"><strong>Owner:</strong> ${ownerContact}</p>` : ""}
            <p class="mb-0 fw-semibold">Rs ${Number(property.price || 0).toLocaleString("en-IN")}</p>
            <p class="property-type-line mt-2 mb-0">
              <span class="property-type-badge">Type: ${getTypeLabel(type)}</span>
            </p>
          </article>
        </div>
      `;
    })
    .join("");
};

const renderFeaturedProperties = (properties) => {
  if (!featuredPropertyGrid) return;

  featuredPropertyGrid.innerHTML = properties
    .slice(0, 3)
    .map((property) => {
      const safeTitle = property.title || "Untitled Property";
      const safeLocation = property.location || "Location unavailable";
      const googleLocation = normalizeMapUrl(property.googleLocation);
      const imageUrl = getImageUrl(property.image);
      const propertyId = property._id || "";

      return `
        <div class="col-md-6 col-lg-4">
          <article class="property-card h-100 ${propertyId ? "map-enabled" : ""}" data-property-id="${propertyId}" data-map-url="${googleLocation}">
            <img src="${imageUrl}" alt="${safeTitle}" class="img-fluid rounded-4 mb-3" />
            <h5 class="fw-semibold">${safeTitle}</h5>
            <p class="text-muted mb-2">${safeLocation}</p>
            <p class="fw-semibold mb-0">Rs ${Number(property.price || 0).toLocaleString("en-IN")}</p>
          </article>
        </div>
      `;
    })
    .join("");
};

const applyPropertyFilters = () => {
  const propertyItems = propertyGrid ? propertyGrid.querySelectorAll(".property-item") : [];
  if (propertyItems.length === 0) {
    if (propertyVisibleCount) propertyVisibleCount.textContent = "0";
    if (propertyTotalCount) propertyTotalCount.textContent = "0";
    return;
  }

  const searchTerm = propertySearchInput ? propertySearchInput.value.trim().toLowerCase() : "";
  const selectedType = propertyTypeFilter ? propertyTypeFilter.value : "all";
  let visibleCount = 0;

  propertyItems.forEach((item) => {
    const title = (item.dataset.title || "").toLowerCase();
    const location = (item.dataset.location || "").toLowerCase();
    const type = item.dataset.type || "";

    const matchesSearch = searchTerm === "" || title.includes(searchTerm) || location.includes(searchTerm);
    const matchesType = selectedType === "all" || type === selectedType;
    const isVisible = matchesSearch && matchesType;

    item.classList.toggle("d-none", !isVisible);
    if (isVisible) visibleCount += 1;
  });

  if (propertyVisibleCount) propertyVisibleCount.textContent = String(visibleCount);
  if (propertyTotalCount) propertyTotalCount.textContent = String(propertyItems.length);
};

const initializePropertyFiltering = () => {
  if (!propertyGrid) return;

  if (propertySearchBtn) propertySearchBtn.addEventListener("click", applyPropertyFilters);
  if (propertyFilterBtn) propertyFilterBtn.addEventListener("click", applyPropertyFilters);

  if (propertySearchInput) {
    propertySearchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyPropertyFilters();
      }
    });
  }
};

const loadPropertiesFromApi = async () => {
  if (!propertyGrid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`);
    if (!response.ok) throw new Error("Could not fetch properties");

    const properties = await response.json();

    if (properties.length === 0) {
      propertyGrid.innerHTML = "";
      if (propertyStatus) {
        propertyStatus.textContent = "No properties available yet.";
        propertyStatus.classList.add("is-empty");
      }
      applyPropertyFilters();
      return;
    }

    if (propertyStatus) propertyStatus.style.display = "none";
    renderProperties(properties);
    applyPropertyFilters();
  } catch (error) {
    if (propertyStatus) {
      propertyStatus.textContent = "Unable to load properties. Please ensure backend is running on port 5000.";
      propertyStatus.classList.add("is-error");
    }
    applyPropertyFilters();
  }
};

const loadFeaturedPropertiesFromApi = async () => {
  if (!featuredPropertyGrid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`);
    if (!response.ok) throw new Error("Could not fetch featured properties");

    const properties = await response.json();

    if (properties.length === 0) {
      featuredPropertyGrid.innerHTML = "";
      if (featuredPropertyStatus) {
        featuredPropertyStatus.textContent = "No properties available yet.";
        featuredPropertyStatus.classList.add("is-empty");
      }
      return;
    }

    if (featuredPropertyStatus) featuredPropertyStatus.style.display = "none";
    renderFeaturedProperties(properties);
  } catch (error) {
    if (featuredPropertyStatus) {
      featuredPropertyStatus.textContent = "Unable to load featured properties.";
      featuredPropertyStatus.classList.add("is-error");
    }
  }
};

if (propertyGrid) {
  initializePropertyFiltering();
  loadPropertiesFromApi();
}

if (featuredPropertyGrid) {
  loadFeaturedPropertiesFromApi();
}

const handleMapCardClick = (event) => {
  if (event.target.closest("a, button, input, select, textarea, label")) return;
  const card = event.target.closest(".property-card");
  if (!card) return;
  const propertyId = card.dataset.propertyId;
  if (!propertyId) return;
  window.location.href = getDetailUrl(propertyId);
};

if (propertyGrid) {
  propertyGrid.addEventListener("click", handleMapCardClick);
}

if (featuredPropertyGrid) {
  featuredPropertyGrid.addEventListener("click", handleMapCardClick);
}
