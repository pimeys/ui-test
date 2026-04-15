(function () {
  "use strict";

  // ========== Auth ==========

  function isAuthenticated() {
    return sessionStorage.getItem("portal_auth") === "1";
  }

  function setAuthenticated(flag) {
    sessionStorage.setItem("portal_auth", flag ? "1" : "0");
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  }

  // ========== Seeded PRNG (mulberry32) ==========

  function mulberry32(seed) {
    var s = seed | 0;
    return function () {
      s = (s + 0x6d2b79f5) | 0;
      var t = Math.imul(s ^ (s >>> 15), s | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ========== Data Constants ==========

  var NAMES = [
    "Kite Packaging Ltd",
    "PP Raw Dog Food Ltd",
    "Adam Hamdi",
    "Rave Coffee HQ",
    "GOODS IN YOUR DEP CO",
    "Express Logistics UK",
    "Northern Freight Co",
    "Swift Parcels Ltd",
    "Metro Distribution",
    "Central Warehouse Co",
    "BrightBox Supplies",
    "Apex Couriers",
  ];

  var SURCHARGES = ["LF", "TL"];

  var BILLING = [
    "1 - Half",
    "1 - Full",
    "2 - Half",
    "2 - Quarter",
    "3 - Half",
    "4 - Half",
  ];

  // How many consignments exist per date
  var DATE_COUNTS = {
    "2026-04-05": 5,
    "2026-04-06": 9,
    "2026-04-07": 18,
    "2026-04-08": 32,
    "2026-04-09": 58,
    "2026-04-10": 47,
    "2026-04-11": 65,
    "2026-04-12": 89,
    "2026-04-13": 340,
    "2026-04-14": 23,
    "2026-04-15": 8,
    "2026-04-16": 14,
    "2026-04-17": 6,
  };

  var ITEMS_PER_PAGE = 85;

  // ========== Date Helpers ==========

  /** Parse DD/MM/YYYY or DD/MM/YY or YYYY-MM-DD into ISO YYYY-MM-DD */
  function parseDate(str) {
    str = (str || "").trim();
    if (!str) return "";
    if (str.indexOf("/") !== -1) {
      var p = str.split("/");
      var yr = p[2];
      if (yr.length === 2) yr = "20" + yr;
      return yr + "-" + p[1] + "-" + p[0];
    }
    return str;
  }

  /** YYYY-MM-DD -> DD/MM/YY */
  function fmtDateShort(iso) {
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0].slice(2);
  }

  /** Iterate dates from..to (inclusive), return array of ISO strings */
  function dateRange(fromIso, toIso) {
    var out = [];
    var d = new Date(fromIso + "T00:00:00");
    var end = new Date(toIso + "T00:00:00");
    while (d <= end) {
      out.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  // ========== Data Generation ==========

  function generateForDate(isoDate) {
    var count = DATE_COUNTS[isoDate] || 0;
    if (count === 0) return [];

    var seed = parseInt(isoDate.replace(/-/g, ""), 10);
    var rng = mulberry32(seed);
    var data = [];
    var baseNum = 74500 + Math.floor(rng() * 2200);

    for (var i = 0; i < count; i++) {
      var consNum;
      if (rng() < 0.03) {
        consNum = "B0" + String(64000 + Math.floor(rng() * 1000));
      } else {
        consNum = "KP" + String(baseNum + i * 3 + Math.floor(rng() * 3));
      }

      // First several entries in the 13th dataset get varied names (matches screenshots)
      var nameIdx;
      if (isoDate === "2026-04-13" && i < 6) {
        nameIdx = Math.floor(rng() * NAMES.length);
      } else {
        nameIdx = rng() < 0.82 ? 0 : Math.floor(rng() * NAMES.length);
      }

      var billing = BILLING[Math.floor(rng() * BILLING.length)];
      var spaces = parseInt(billing.charAt(0), 10);

      data.push({
        id: consNum,
        name: NAMES[nameIdx],
        date: fmtDateShort(isoDate),
        surcharge: SURCHARGES[Math.floor(rng() * SURCHARGES.length)],
        billing: billing,
        spaces: spaces,
        weight: Math.floor(rng() * 650) + 50,
      });
    }
    return data;
  }

  function generateRange(fromIso, toIso) {
    var dates = dateRange(fromIso, toIso);
    var all = [];
    for (var i = 0; i < dates.length; i++) {
      all = all.concat(generateForDate(dates[i]));
    }
    return all;
  }

  function computeStatus(data, fromIso, toIso) {
    var total = data.length;
    if (total === 0)
      return {
        notPrinted: 0,
        printed: 0,
        discrepancies: 0,
        paperwork: 0,
        outstanding: 0,
        completed: 0,
        total: 0,
      };

    // Exact values from the real portal for 13/04/2026
    if (fromIso === "2026-04-13" && toIso === "2026-04-13") {
      return {
        notPrinted: 15,
        printed: 325,
        discrepancies: 0,
        paperwork: 0,
        outstanding: 337,
        completed: 3,
        total: 340,
      };
    }

    // Compute proportionally for other dates
    var rng = mulberry32(total * 31 + fromIso.charCodeAt(8));
    var completed = Math.max(0, Math.round(total * 0.009 + rng() * 2));
    var notPrinted = Math.max(0, Math.round(total * 0.044 + rng() * 1));
    var printed = total - notPrinted;
    var disc = total > 150 ? Math.floor(rng() * 2) : 0;
    return {
      notPrinted: notPrinted,
      printed: printed,
      discrepancies: disc,
      paperwork: 0,
      outstanding: total - completed,
      completed: completed,
      total: total,
    };
  }

  // ========== Consignment Page Rendering ==========

  var currentData = [];
  var currentPage = 1;

  function renderStatusCards(st) {
    var el = document.getElementById("status-cards");
    if (!el) return;
    el.innerHTML =
      sc("Not Printed", st.notPrinted, "") +
      sc("Printed", st.printed, "") +
      sc("Discrepancies", st.discrepancies, "") +
      sc("Paperwork", st.paperwork, "Attached") +
      sc("Outstanding", st.outstanding, "") +
      sc("Completed", st.completed, "") +
      sc("Total Orders", st.total, "");
  }

  function sc(label, value, sub) {
    return (
      '<div class="status-card"><div class="sc-label">' +
      label +
      '</div><div class="sc-value">' +
      value +
      "</div>" +
      (sub ? '<div class="sc-sub">' + sub + "</div>" : "") +
      "</div>"
    );
  }

  function renderTable(data, page) {
    var tbody = document.getElementById("table-body");
    if (!tbody) return;
    var start = (page - 1) * ITEMS_PER_PAGE;
    var end = Math.min(start + ITEMS_PER_PAGE, data.length);
    var rows = data.slice(start, end);
    var html = "";
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      html +=
        "<tr>" +
        '<td class="col-check"><input type="checkbox"></td>' +
        "<td>" + r.id + "</td>" +
        "<td>" + r.name + "</td>" +
        "<td>" + r.date + "</td>" +
        "<td>" + r.surcharge + "</td>" +
        "<td>" + r.billing + "</td>" +
        "<td>" + r.spaces + "</td>" +
        "<td>" + r.weight + "</td>" +
        '<td class="col-actions">' +
        '<button title="Edit">&#9998;</button>' +
        '<button title="View">&#9673;</button>' +
        '<button title="Print">&#9113;</button>' +
        '<button title="Delete">&#10005;</button>' +
        "</td></tr>";
    }
    tbody.innerHTML = html;
  }

  function renderPagination(total, page) {
    var el = document.getElementById("pagination");
    if (!el) return;
    var pages = Math.ceil(total / ITEMS_PER_PAGE);
    if (pages < 1) pages = 1;
    var html = '<span class="page-info">(' + total + " items)</span>";
    for (var i = 1; i <= pages; i++) {
      html +=
        '<button class="page-btn' +
        (i === page ? " active" : "") +
        '" data-p="' + i + '">' + i + "</button>";
    }
    el.innerHTML = html;

    var btns = el.querySelectorAll(".page-btn");
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener("click", onPageClick);
    }
  }

  function onPageClick() {
    currentPage = parseInt(this.getAttribute("data-p"), 10);
    renderTable(currentData, currentPage);
    renderPagination(currentData.length, currentPage);
    // Scroll the table frame back to top
    var wrap = document.querySelector(".table-wrap");
    if (wrap) wrap.scrollTop = 0;
  }

  function applyFilter() {
    var fromStr = document.getElementById("date-from").value;
    var toStr = document.getElementById("date-to").value;
    var fromIso = parseDate(fromStr);
    var toIso = parseDate(toStr);

    if (!fromIso || !toIso) {
      alert("Please enter dates in DD/MM/YYYY format.");
      return;
    }

    currentData = generateRange(fromIso, toIso);
    currentPage = 1;
    renderStatusCards(computeStatus(currentData, fromIso, toIso));
    renderTable(currentData, currentPage);
    renderPagination(currentData.length, currentPage);
    // Scroll the table frame back to top on new filter
    var wrap = document.querySelector(".table-wrap");
    if (wrap) wrap.scrollTop = 0;
  }

  // ========== Login Page ==========

  function initLogin() {
    // Clear auth when visiting login (fresh session)
    setAuthenticated(false);

    var form = document.getElementById("login-form");
    var errorEl = document.getElementById("login-error");
    var overlay = document.getElementById("session-overlay");
    var dialogUser = document.getElementById("dialog-user");
    var btnConfirm = document.getElementById("btn-confirm");
    var btnCancel = document.getElementById("btn-cancel");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = document.getElementById("username").value.trim();
      var p = document.getElementById("password").value;

      if (u === "username" && p === "password") {
        errorEl.style.display = "none";
        dialogUser.textContent = u;
        overlay.classList.add("visible");
      } else {
        errorEl.style.display = "block";
      }
    });

    btnConfirm.addEventListener("click", function () {
      setAuthenticated(true);
      window.location.href = "dashboard.html";
    });

    btnCancel.addEventListener("click", function () {
      overlay.classList.remove("visible");
    });
  }

  // ========== Dashboard Page ==========

  function initDashboard() {
    if (!requireAuth()) return;
    var h = new Date().getHours();
    var g = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
    var el = document.getElementById("greeting-text");
    if (el) el.textContent = g + ", Portal User.";
  }

  // ========== Consignment Page ==========

  function initConsignment() {
    if (!requireAuth()) return;

    document.getElementById("apply-filter").addEventListener("click", applyFilter);

    // Allow Enter key in date fields to trigger filter
    var dateFrom = document.getElementById("date-from");
    var dateTo = document.getElementById("date-to");
    function onEnter(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFilter();
      }
    }
    dateFrom.addEventListener("keydown", onEnter);
    dateTo.addEventListener("keydown", onEnter);

    // Load default data
    applyFilter();
  }

  // ========== Boot ==========

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    if (page === "login") initLogin();
    else if (page === "dashboard") initDashboard();
    else if (page === "consignment") initConsignment();
  });
})();
