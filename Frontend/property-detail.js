const API_BASE_URL = "http://localhost:5000";

const yearEl = document.getElementById("year");
const statusEl = document.getElementById("propertyDetailStatus");
const contentEl = document.getElementById("propertyDetailContent");
const titleEl = document.getElementById("detailTitle");
const typeBadgeEl = document.getElementById("detailTypeBadge");
const mainImageEl = document.getElementById("detailMainImage");
const locationEl = document.getElementById("detailLocation");
const priceEl = document.getElementById("detailPrice");
const storeEl = document.getElementById("detailStore");
const descriptionEl = document.getElementById("detailDescription");
const callBtn = document.getElementById("detailCallBtn");
const whatsappBtn = document.getElementById("detailWhatsAppBtn");
const specsEl = document.getElementById("detailSpecs");
const businessFitEl = document.getElementById("detailBusinessFit");
const pricingEl = document.getElementById("detailPricing");
const galleryEl = document.getElementById("detailGallery");
const videoLinkEl = document.getElementById("detailVideoLink");
const contactEl = document.getElementById("detailContact");
const locationInfoEl = document.getElementById("detailLocationInfo");
const mapWrapEl = document.getElementById("detailMapWrap");
const mapFrameEl = document.getElementById("detailMapFrame");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const getImageUrl = (imageName) => {
  if (!imageName) {
    return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";
  }
  if (String(imageName).startsWith("http")) return imageName;
  return `${API_BASE_URL}/uploads/${imageName}`;
};

const normalizeMapUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(url)}`;
};

const getMapEmbedUrl = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      const queryParam = parsed.searchParams.get("q") || parsed.searchParams.get("query");
      if (queryParam) {
        return `https://www.google.com/maps?q=${encodeURIComponent(queryParam)}&output=embed`;
      }
    } catch (_) {}
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(raw)}&output=embed`;
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const formatBoolean = (value) => (value ? "Yes" : "No");

const createMetric = (label, value) => `
  <div class="col-md-6 col-lg-4">
    <article class="detail-metric">
      <p class="detail-metric-label mb-1">${label}</p>
      <p class="detail-metric-value mb-0">${value || "-"}</p>
    </article>
  </div>
`;

const renderListTags = (items) => {
  if (!Array.isArray(items) || items.length === 0) return `<p class="text-muted mb-0">-</p>`;
  return items.map((item) => `<span class="detail-tag">${item}</span>`).join("");
};

const getPropertyIdFromQuery = () => new URLSearchParams(window.location.search).get("id");

const setStatus = (message, tone = "normal") => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove("is-error", "is-empty");
  if (tone === "error") statusEl.classList.add("is-error");
  if (tone === "empty") statusEl.classList.add("is-empty");
  statusEl.style.display = "block";
};

const renderProperty = (property) => {
  if (!property) return;

  const typeLabel = property.propertyType || "Property";
  const mapUrl = normalizeMapUrl(property.googleLocation || property.location);
  const mainImage = getImageUrl(property.image);
  const gallery = Array.isArray(property.gallery) ? property.gallery : [];

  if (titleEl) titleEl.textContent = property.title || "Untitled Property";
  if (typeBadgeEl) typeBadgeEl.textContent = typeLabel;
  if (mainImageEl) {
    mainImageEl.src = mainImage;
    mainImageEl.alt = property.title || "Property image";
  }
  if (locationEl) locationEl.textContent = property.location || "Location unavailable";
  if (priceEl) priceEl.textContent = formatCurrency(property.price);
  if (storeEl) storeEl.innerHTML = `<strong>Store:</strong> ${property.storeName || "-"}`;
  if (descriptionEl) descriptionEl.textContent = property.description || "No description provided.";

  if (callBtn) {
    const ownerPhone = String(property.ownerContact || "").trim();
    if (ownerPhone) {
      callBtn.href = `tel:${ownerPhone.replace(/\s+/g, "")}`;
      callBtn.textContent = "Call Owner";
      callBtn.classList.remove("d-none", "disabled");
      callBtn.removeAttribute("aria-disabled");
    } else {
      callBtn.href = "#";
      callBtn.textContent = "Call Owner (Not Available)";
      callBtn.classList.remove("d-none");
      callBtn.classList.add("disabled");
      callBtn.setAttribute("aria-disabled", "true");
    }
  }

  if ((property.whatsappNumber || property.ownerContact) && whatsappBtn) {
    const rawNumber = String(property.whatsappNumber || property.ownerContact).replace(/[^0-9]/g, "");
    whatsappBtn.href = `https://wa.me/${rawNumber}`;
    whatsappBtn.classList.remove("d-none");
  }

  if (specsEl) {
    specsEl.innerHTML = [
      createMetric("Area (sq ft)", property.areaSqFt || "-"),
      createMetric("Frontage", property.frontage || "-"),
      createMetric("Facing", property.facing || "-"),
      createMetric("Parking", property.parking || "-"),
      createMetric("Possession", property.possessionStatus || "-"),
      createMetric("Floors Allowed", property.floorsAllowed || "-")
    ].join("");
  }

  if (businessFitEl) {
    businessFitEl.innerHTML = `
      ${createMetric("Footfall Rating", property.footfallRating || "-")}
      ${createMetric("Road Width", property.roadWidth || "-")}
      <div class="col-12">
        <article class="detail-metric">
          <p class="detail-metric-label mb-2">Best For</p>
          <div class="d-flex flex-wrap gap-2">${renderListTags(property.bestFor)}</div>
        </article>
      </div>
      <div class="col-12">
        <article class="detail-metric">
          <p class="detail-metric-label mb-2">Nearby</p>
          <div class="d-flex flex-wrap gap-2">${renderListTags(property.nearby)}</div>
        </article>
      </div>
    `;
  }

  if (pricingEl) {
    pricingEl.innerHTML = [
      createMetric("Total Price", formatCurrency(property.price)),
      createMetric("Price / sq ft", property.pricePerSqFt ? formatCurrency(property.pricePerSqFt) : "-"),
      createMetric("Maintenance", property.maintenanceCost ? formatCurrency(property.maintenanceCost) : "-"),
      createMetric("Negotiable", formatBoolean(Boolean(property.negotiable)))
    ].join("");
  }

  if (galleryEl) {
    const allImages = [property.image, ...gallery].filter(Boolean);
    galleryEl.innerHTML =
      allImages.length === 0
        ? `<div class="col-12"><p class="text-muted mb-0">No additional media.</p></div>`
        : allImages
            .slice(0, 8)
            .map(
              (img) => `
                <div class="col-6 col-md-4 col-lg-3">
                  <img class="detail-gallery-image" src="${getImageUrl(img)}" alt="Property gallery image" />
                </div>
              `
            )
            .join("");
  }

  if (property.videoTourUrl && videoLinkEl) {
    videoLinkEl.href = property.videoTourUrl;
    videoLinkEl.classList.remove("d-none");
  }

  if (contactEl) {
    contactEl.innerHTML = [
      createMetric("Owner Name", property.ownerName || "-"),
      createMetric("Contact Number", property.ownerContact || "-"),
      createMetric("WhatsApp", property.whatsappNumber || "-"),
      createMetric("Email", property.ownerEmail || "-")
    ].join("");
  }

  if (locationInfoEl) {
    locationInfoEl.innerHTML = [
      createMetric("Address / Location", property.location || "-"),
      createMetric("Landmark", property.landmark || "-"),
      createMetric("City", property.city || "-"),
      createMetric("Pincode", property.pincode || "-")
    ].join("");
  }

  const mapEmbedUrl = getMapEmbedUrl(property.googleLocation || property.location);
  if (mapWrapEl && mapFrameEl && mapEmbedUrl) {
    mapFrameEl.src = mapEmbedUrl;
    mapWrapEl.classList.remove("d-none");
  }
};

const loadPropertyDetail = async () => {
  const propertyId = getPropertyIdFromQuery();
  if (!propertyId) {
    setStatus("Property id is missing in URL.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load property details");
    }

    renderProperty(result);
    if (statusEl) statusEl.style.display = "none";
    if (contentEl) contentEl.classList.remove("d-none");
  } catch (error) {
    setStatus(error.message || "Unable to load property details.", "error");
  }
};

loadPropertyDetail();
