const API_BASE_URL = "http://localhost:5000";
const TOKEN_KEY = "propertyworks_admin_token";

const adminLoginForm = document.getElementById("adminLoginForm");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");
const refreshAnalyticsBtn = document.getElementById("refreshAnalyticsBtn");

const analyticsSection = document.getElementById("analyticsSection");
const analyticsLocked = document.getElementById("analyticsLocked");

const totalStoresMetric = document.getElementById("totalStoresMetric");
const totalListingsMetric = document.getElementById("totalListingsMetric");
const avgPriceMetric = document.getElementById("avgPriceMetric");
const totalLocationsMetric = document.getElementById("totalLocationsMetric");

const overallProgressText = document.getElementById("overallProgressText");
const overallProgressBar = document.getElementById("overallProgressBar");

const imageCoverageLabel = document.getElementById("imageCoverageLabel");
const imageCoverageBar = document.getElementById("imageCoverageBar");
const descriptionCoverageLabel = document.getElementById("descriptionCoverageLabel");
const descriptionCoverageBar = document.getElementById("descriptionCoverageBar");
const activeShopsLabel = document.getElementById("activeShopsLabel");
const activeShopsBar = document.getElementById("activeShopsBar");

const storePerformanceBody = document.getElementById("storePerformanceBody");
const recentUpdatesList = document.getElementById("recentUpdatesList");

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(value)));

const setAuthStatus = (message, tone = "info") => {
  if (!authStatus) return;
  authStatus.textContent = message;
  authStatus.classList.remove("is-success", "is-error");
  if (tone === "success") authStatus.classList.add("is-success");
  if (tone === "error") authStatus.classList.add("is-error");
};

const setBar = (barEl, labelEl, percent, textValue) => {
  const normalized = clampPercent(percent);
  if (barEl) {
    barEl.style.width = `${normalized}%`;
    barEl.textContent = textValue || `${normalized}%`;
  }
  if (labelEl) labelEl.textContent = `${normalized}%`;
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;

const calculateStoreProgress = (store) => {
  const imageCoverage = store.total > 0 ? (store.withImage / store.total) * 100 : 0;
  const descriptionCoverage = store.total > 0 ? (store.withDescription / store.total) * 100 : 0;
  const scaleScore = Math.min(100, (store.total / 5) * 100);
  return clampPercent(scaleScore * 0.35 + imageCoverage * 0.35 + descriptionCoverage * 0.3);
};

const mapStoreStats = (properties) => {
  const storeMap = new Map();

  properties.forEach((property) => {
    const storeName = (property.storeName || "Unknown Store").trim() || "Unknown Store";
    if (!storeMap.has(storeName)) {
      storeMap.set(storeName, {
        name: storeName,
        total: 0,
        withImage: 0,
        withDescription: 0,
        priceSum: 0
      });
    }

    const current = storeMap.get(storeName);
    current.total += 1;
    current.priceSum += Number(property.price || 0);
    if (property.image) current.withImage += 1;
    if (property.description && property.description.trim()) current.withDescription += 1;
  });

  return Array.from(storeMap.values()).map((store) => ({
    ...store,
    avgPrice: store.total > 0 ? store.priceSum / store.total : 0,
    progressScore: calculateStoreProgress(store)
  }));
};

const renderSummaryMetrics = (properties, stores) => {
  const totalListings = properties.length;
  const totalStores = stores.length;
  const totalLocations = new Set(properties.map((property) => (property.location || "").trim()).filter(Boolean)).size;
  const avgPrice =
    totalListings > 0
      ? properties.reduce((acc, property) => acc + Number(property.price || 0), 0) / totalListings
      : 0;

  if (totalStoresMetric) totalStoresMetric.textContent = String(totalStores);
  if (totalListingsMetric) totalListingsMetric.textContent = String(totalListings);
  if (avgPriceMetric) avgPriceMetric.textContent = formatCurrency(avgPrice);
  if (totalLocationsMetric) totalLocationsMetric.textContent = String(totalLocations);
};

const renderProgressMetrics = (properties, stores) => {
  const totalListings = properties.length || 1;
  const imageCoverage =
    properties.filter((property) => property.image && String(property.image).trim()).length / totalListings;
  const descriptionCoverage =
    properties.filter((property) => property.description && String(property.description).trim()).length /
    totalListings;

  const activeShopsPercent =
    stores.length === 0 ? 0 : (stores.filter((store) => store.total >= 2).length / stores.length) * 100;

  const overallProgress =
    clampPercent(imageCoverage * 100 * 0.35 + descriptionCoverage * 100 * 0.35 + activeShopsPercent * 0.3);

  if (overallProgressText) overallProgressText.textContent = `${overallProgress}% complete`;
  setBar(overallProgressBar, null, overallProgress, `${overallProgress}%`);
  setBar(imageCoverageBar, imageCoverageLabel, imageCoverage * 100);
  setBar(descriptionCoverageBar, descriptionCoverageLabel, descriptionCoverage * 100);
  setBar(activeShopsBar, activeShopsLabel, activeShopsPercent);
};

const renderStorePerformance = (stores) => {
  if (!storePerformanceBody) return;

  if (stores.length === 0) {
    storePerformanceBody.innerHTML = `<tr><td colspan="4" class="text-muted">No store data available.</td></tr>`;
    return;
  }

  const sortedStores = [...stores].sort((a, b) => b.progressScore - a.progressScore);
  storePerformanceBody.innerHTML = sortedStores
    .map(
      (store) => `
        <tr>
          <td>${store.name}</td>
          <td>${store.total}</td>
          <td>${formatCurrency(store.avgPrice)}</td>
          <td>
            <div class="progress progress-thin">
              <div class="progress-bar" style="width: ${store.progressScore}%">${store.progressScore}%</div>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
};

const renderRecentUpdates = (properties) => {
  if (!recentUpdatesList) return;

  if (properties.length === 0) {
    recentUpdatesList.innerHTML = `<p class="admin-status mb-0">No recent updates found.</p>`;
    return;
  }

  const recent = [...properties]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 6);

  recentUpdatesList.innerHTML = recent
    .map((property) => {
      const createdDate = property.createdAt
        ? new Date(property.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "Unknown date";

      return `
        <article class="admin-property-item">
          <div>
            <h3 class="h6 fw-semibold mb-1">${property.title || "Untitled listing"}</h3>
            <p class="mb-1 text-muted">${property.storeName || "Unknown Store"} • ${property.location || "No location"}</p>
            <p class="mb-0 small">Updated on ${createdDate}</p>
          </div>
          <span class="badge text-bg-light">${formatCurrency(property.price)}</span>
        </article>
      `;
    })
    .join("");
};

const renderAnalytics = (properties) => {
  const stores = mapStoreStats(properties);
  renderSummaryMetrics(properties, stores);
  renderProgressMetrics(properties, stores);
  renderStorePerformance(stores);
  renderRecentUpdates(properties);
};

const fetchAnalytics = async () => {
  if (!getToken()) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`);
    if (!response.ok) throw new Error("Failed to fetch analytics data");
    const properties = await response.json();
    renderAnalytics(Array.isArray(properties) ? properties : []);
  } catch (error) {
    setAuthStatus("Logged in, but failed to load analytics data.", "error");
  }
};

const updateAccessView = () => {
  const loggedIn = Boolean(getToken());

  if (analyticsSection) analyticsSection.classList.toggle("d-none", !loggedIn);
  if (analyticsLocked) analyticsLocked.classList.toggle("d-none", loggedIn);
  if (adminLoginForm) adminLoginForm.classList.toggle("d-none", loggedIn);
  if (logoutBtn) logoutBtn.classList.toggle("d-none", !loggedIn);

  if (loggedIn) {
    setAuthStatus("Logged in. Analytics data is ready.", "success");
  } else {
    setAuthStatus("Not logged in.");
  }
};

const loginAdmin = async (event) => {
  event.preventDefault();

  const formData = new FormData(adminLoginForm);
  const payload = {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || "")
  };

  if (!payload.email || !payload.password) {
    setAuthStatus("Email and password are required.", "error");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) throw new Error(result.message || "Login failed");
    if (!result.token) throw new Error("Token missing in login response");

    setToken(result.token);
    updateAccessView();
    fetchAnalytics();
  } catch (error) {
    setAuthStatus(error.message || "Login failed.", "error");
  }
};

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", loginAdmin);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearToken();
    if (adminLoginForm) adminLoginForm.reset();
    updateAccessView();
  });
}

if (refreshAnalyticsBtn) {
  refreshAnalyticsBtn.addEventListener("click", fetchAnalytics);
}

updateAccessView();
if (getToken()) fetchAnalytics();
