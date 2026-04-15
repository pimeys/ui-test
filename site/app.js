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
    "Greenfield Packaging Ltd",
    "Northway Pet Supplies Ltd",
    "J. Harmon",
    "Redstone Roasters HQ",
    "ALLSTOCK DEPOT CO",
    "Ridgeway Logistics UK",
    "Pennine Freight Co",
    "Whitmore Parcels Ltd",
    "Lakeside Distribution",
    "Broadgate Warehouse Co",
    "Clearpath Supplies",
    "Summit Couriers",
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

  // ========== Loading Configuration ==========

  var DELAY_AUTH = 1200; // Login credential check
  var DELAY_SIGN_IN = 1500; // Session establishment after confirm
  var DELAY_PAGE = 1800; // Full page content load (dashboard/consignment)
  var DELAY_DATA = 1200; // Data refresh (filter apply)
  var DELAY_PAGE_NAV = 700; // Table pagination

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

  /** Build YYYY-MM-DD from a local Date (avoids UTC shift from toISOString) */
  function localIso(d) {
    return (
      d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate())
    );
  }

  /** Iterate dates from..to (inclusive), return array of ISO strings */
  function dateRange(fromIso, toIso) {
    var out = [];
    var d = new Date(fromIso + "T00:00:00");
    var end = new Date(toIso + "T00:00:00");
    while (d <= end) {
      out.push(localIso(d));
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
        consNum = "BX" + String(64000 + Math.floor(rng() * 1000));
      } else {
        consNum = "GF" + String(baseNum + i * 3 + Math.floor(rng() * 3));
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

  // ========== Date Picker State ==========

  var MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  var dpFromIso = "2026-04-15";
  var dpToIso = "2026-04-15";
  var dpViewYear = 2026;
  var dpViewMonth = 3; // 0-indexed, 3 = April
  var dpSelecting = "from"; // which field the next calendar click sets
  var dpHoverIso = ""; // date being hovered during "to" selection

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function fmtTrigger(fromIso, toIso) {
    return fmtDateShort(fromIso) + " \u2013 " + fmtDateShort(toIso);
  }

  function renderCalendar() {
    var el = document.getElementById("dp-calendar");
    if (!el) return;

    var firstDay = new Date(dpViewYear, dpViewMonth, 1).getDay();
    var startCol = (firstDay + 6) % 7; // Mon=0
    var daysInMonth = new Date(dpViewYear, dpViewMonth + 1, 0).getDate();
    var todayIso = localIso(new Date());

    var html = '<div class="dp-nav">';
    html += '<button type="button" id="dp-prev">&lsaquo;</button>';
    html += "<span>" + MONTHS[dpViewMonth] + " " + dpViewYear + "</span>";
    html += '<button type="button" id="dp-next">&rsaquo;</button>';
    html += "</div>";

    html += '<table class="dp-grid"><thead><tr>';
    html +=
      "<th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th><th>Su</th>";
    html += "</tr></thead><tbody>";

    var day = 1;
    for (var row = 0; row < 6 && day <= daysInMonth; row++) {
      html += "<tr>";
      for (var col = 0; col < 7; col++) {
        if ((row === 0 && col < startCol) || day > daysInMonth) {
          html += "<td></td>";
        } else {
          var iso = dpViewYear + "-" + pad2(dpViewMonth + 1) + "-" + pad2(day);
          var cls = "dp-day";
          var effTo =
            dpSelecting === "to" && dpHoverIso && dpHoverIso >= dpFromIso
              ? dpHoverIso
              : dpToIso;
          if (dpFromIso && iso === dpFromIso) cls += " dp-sel";
          else if (effTo && iso === effTo) cls += " dp-sel";
          else if (dpFromIso && effTo && iso > dpFromIso && iso < effTo)
            cls += " dp-in-range";
          if (iso === todayIso) cls += " dp-today";
          html +=
            '<td><div class="' +
            cls +
            '" data-date="' +
            iso +
            '">' +
            day +
            "</div></td>";
          day++;
        }
      }
      html += "</tr>";
    }
    html += "</tbody></table>";
    el.innerHTML = html;

    // Bind nav
    document.getElementById("dp-prev").addEventListener("click", function () {
      dpViewMonth--;
      if (dpViewMonth < 0) {
        dpViewMonth = 11;
        dpViewYear--;
      }
      renderCalendar();
    });
    document.getElementById("dp-next").addEventListener("click", function () {
      dpViewMonth++;
      if (dpViewMonth > 11) {
        dpViewMonth = 0;
        dpViewYear++;
      }
      renderCalendar();
    });

    // Bind day clicks
    var days = el.querySelectorAll(".dp-day");
    for (var i = 0; i < days.length; i++) {
      days[i].addEventListener("click", onDayClick);
      days[i].addEventListener("mouseenter", onDayHover);
    }
  }

  function onDayClick() {
    var iso = this.getAttribute("data-date");
    if (!iso) return;

    if (dpSelecting === "from") {
      // First click: set start date, enter range-selection mode
      dpFromIso = iso;
      dpToIso = "";
      dpHoverIso = "";
      dpSelecting = "to";

      var fromEl = document.getElementById("dp-from");
      var toEl = document.getElementById("dp-to");
      if (fromEl) fromEl.value = fmtDateLong(dpFromIso);
      if (toEl) toEl.value = "";

      updateRangeClasses();
    } else {
      // Second click: set end date
      if (iso >= dpFromIso) {
        dpToIso = iso;
      } else {
        // Clicked before start — make this the new start, stay in "to" mode
        dpFromIso = iso;
        dpToIso = "";
        dpHoverIso = "";

        var fromEl2 = document.getElementById("dp-from");
        var toEl2 = document.getElementById("dp-to");
        if (fromEl2) fromEl2.value = fmtDateLong(dpFromIso);
        if (toEl2) toEl2.value = "";

        updateRangeClasses();
        return;
      }

      dpHoverIso = "";
      dpSelecting = "from";

      var fromEl3 = document.getElementById("dp-from");
      var toEl3 = document.getElementById("dp-to");
      if (fromEl3) fromEl3.value = fmtDateLong(dpFromIso);
      if (toEl3) toEl3.value = fmtDateLong(dpToIso);

      updateRangeClasses();
    }
  }

  /** Update range highlight classes on existing DOM without re-rendering */
  function updateRangeClasses() {
    var el = document.getElementById("dp-calendar");
    if (!el) return;
    var days = el.querySelectorAll(".dp-day");
    var effTo =
      dpSelecting === "to" && dpHoverIso && dpHoverIso >= dpFromIso
        ? dpHoverIso
        : dpToIso;

    for (var i = 0; i < days.length; i++) {
      var iso = days[i].getAttribute("data-date");
      days[i].classList.remove("dp-sel", "dp-in-range");

      if (dpFromIso && iso === dpFromIso) {
        days[i].classList.add("dp-sel");
      } else if (effTo && iso === effTo) {
        days[i].classList.add("dp-sel");
      } else if (dpFromIso && effTo && iso > dpFromIso && iso < effTo) {
        days[i].classList.add("dp-in-range");
      }
    }
  }

  function onDayHover() {
    if (dpSelecting !== "to") return;
    var iso = this.getAttribute("data-date");
    if (!iso) return;

    if (iso < dpFromIso) {
      // Hovering before start — clear range preview
      dpHoverIso = "";
      updateRangeClasses();
      var toEl = document.getElementById("dp-to");
      if (toEl) toEl.value = "";
      return;
    }

    dpHoverIso = iso;
    updateRangeClasses();
    var toEl2 = document.getElementById("dp-to");
    if (toEl2) toEl2.value = fmtDateLong(iso);
  }

  /** YYYY-MM-DD -> DD/MM/YYYY */
  function fmtDateLong(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }

  function openDatePicker() {
    var drop = document.getElementById("date-picker");
    if (!drop) return;
    // Sync view month to current from date
    var parts = dpFromIso.split("-");
    dpViewYear = parseInt(parts[0], 10);
    dpViewMonth = parseInt(parts[1], 10) - 1;
    dpSelecting = "from";
    dpHoverIso = "";

    document.getElementById("dp-from").value = fmtDateLong(dpFromIso);
    document.getElementById("dp-to").value = fmtDateLong(dpToIso);

    renderCalendar();
    drop.classList.add("open");
  }

  function closeDatePicker() {
    var drop = document.getElementById("date-picker");
    if (drop) drop.classList.remove("open");
  }

  // ========== Loading Helpers ==========

  var pendingTimeout = null;
  var pendingHide = null;

  function cancelPending() {
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    if (pendingHide) {
      pendingHide();
      pendingHide = null;
    }
  }

  function showLoading(container, msg, isData) {
    var overlay = document.createElement("div");
    overlay.className =
      "loading-overlay" + (isData ? " loading-overlay-data" : "");
    overlay.innerHTML =
      '<div class="loading-spinner"></div>' +
      '<div class="loading-text">' +
      (msg || "Loading...") +
      "</div>";
    container.appendChild(overlay);
    return function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
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
        "<td>" +
        r.id +
        "</td>" +
        "<td>" +
        r.name +
        "</td>" +
        "<td>" +
        r.date +
        "</td>" +
        "<td>" +
        r.surcharge +
        "</td>" +
        "<td>" +
        r.billing +
        "</td>" +
        "<td>" +
        r.spaces +
        "</td>" +
        "<td>" +
        r.weight +
        "</td>" +
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
        '" data-p="' +
        i +
        '">' +
        i +
        "</button>";
    }
    el.innerHTML = html;

    var btns = el.querySelectorAll(".page-btn");
    for (var j = 0; j < btns.length; j++) {
      btns[j].addEventListener("click", onPageClick);
    }
  }

  function onPageClick() {
    var p = parseInt(this.getAttribute("data-p"), 10);
    if (p === currentPage) return;
    currentPage = p;

    cancelPending();

    var wrap = document.querySelector(".table-wrap");
    pendingHide = showLoading(wrap, "Loading...", true);

    pendingTimeout = setTimeout(function () {
      pendingTimeout = null;
      renderTable(currentData, currentPage);
      renderPagination(currentData.length, currentPage);
      pendingHide();
      pendingHide = null;
      wrap.scrollTop = 0;
    }, DELAY_PAGE_NAV);
  }

  function applyFilter() {
    // Read from the date picker text fields (user may have typed directly)
    var fromEl = document.getElementById("dp-from");
    var toEl = document.getElementById("dp-to");

    if (fromEl && toEl) {
      var fi = parseDate(fromEl.value);
      var ti = parseDate(toEl.value);
      if (fi) dpFromIso = fi;
      if (ti) dpToIso = ti;
    }

    if (!dpFromIso || !dpToIso) {
      alert("Please enter dates in DD/MM/YYYY format.");
      return;
    }

    // Update trigger button text
    var trigger = document.getElementById("date-trigger");
    if (trigger) trigger.textContent = fmtTrigger(dpFromIso, dpToIso);

    closeDatePicker();
    cancelPending();

    var main = document.querySelector(".main-content");
    pendingHide = showLoading(main);

    pendingTimeout = setTimeout(function () {
      pendingTimeout = null;
      currentData = generateRange(dpFromIso, dpToIso);
      currentPage = 1;
      renderStatusCards(computeStatus(currentData, dpFromIso, dpToIso));
      renderTable(currentData, currentPage);
      renderPagination(currentData.length, currentPage);
      pendingHide();
      pendingHide = null;
      var wrap = document.querySelector(".table-wrap");
      if (wrap) wrap.scrollTop = 0;
    }, DELAY_DATA);
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
    var loginBtn = form.querySelector(".login-btn");
    var loginText = loginBtn.textContent;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = document.getElementById("username").value.trim();
      var p = document.getElementById("password").value;

      // Disable button and show authenticating state
      loginBtn.disabled = true;
      loginBtn.textContent = "Authenticating...";
      errorEl.style.display = "none";

      setTimeout(function () {
        loginBtn.disabled = false;
        loginBtn.textContent = loginText;

        if (u === "username" && p === "password") {
          dialogUser.textContent = u;
          overlay.classList.add("visible");
        } else {
          errorEl.style.display = "block";
        }
      }, DELAY_AUTH);
    });

    btnConfirm.addEventListener("click", function () {
      setAuthenticated(true);
      btnConfirm.disabled = true;
      btnConfirm.textContent = "Signing in...";
      btnCancel.disabled = true;

      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, DELAY_SIGN_IN);
    });

    btnCancel.addEventListener("click", function () {
      overlay.classList.remove("visible");
    });
  }

  // ========== Dashboard Page ==========

  function initDashboard() {
    if (!requireAuth()) return;

    var main = document.querySelector(".main-content");
    var hide = showLoading(main);

    setTimeout(function () {
      var h = new Date().getHours();
      var g =
        h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
      var el = document.getElementById("greeting-text");
      if (el) el.textContent = g + ", Portal User.";
      hide();
    }, DELAY_PAGE);
  }

  // ========== Consignment Page ==========

  function initConsignment() {
    if (!requireAuth()) return;

    // Set correct trigger text immediately (behind the overlay)
    var trigger = document.getElementById("date-trigger");
    if (trigger) trigger.textContent = fmtTrigger(dpFromIso, dpToIso);

    // Date range trigger opens the picker
    document
      .getElementById("date-trigger")
      .addEventListener("click", function (e) {
        e.stopPropagation();
        var drop = document.getElementById("date-picker");
        if (drop.classList.contains("open")) {
          closeDatePicker();
        } else {
          openDatePicker();
        }
      });

    // Apply / Cancel inside the picker
    document.getElementById("dp-apply").addEventListener("click", function () {
      applyFilter();
    });
    document.getElementById("dp-cancel").addEventListener("click", function () {
      closeDatePicker();
    });

    // Enter key in picker text fields triggers apply
    var dpFrom = document.getElementById("dp-from");
    var dpTo = document.getElementById("dp-to");
    function onEnter(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        applyFilter();
      }
    }
    dpFrom.addEventListener("keydown", onEnter);
    dpTo.addEventListener("keydown", onEnter);

    // Prevent clicks inside picker from closing it
    document
      .getElementById("date-picker")
      .addEventListener("click", function (e) {
        e.stopPropagation();
      });

    // Click outside closes the picker
    document.addEventListener("click", function () {
      closeDatePicker();
    });

    // Show page loading overlay, then populate initial data
    var main = document.querySelector(".main-content");
    var hidePageLoad = showLoading(main);

    setTimeout(function () {
      currentData = generateRange(dpFromIso, dpToIso);
      currentPage = 1;
      renderStatusCards(computeStatus(currentData, dpFromIso, dpToIso));
      renderTable(currentData, currentPage);
      renderPagination(currentData.length, currentPage);
      hidePageLoad();
    }, DELAY_PAGE);
  }

  // ========== Boot ==========

  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.getAttribute("data-page");
    if (page === "login") initLogin();
    else if (page === "dashboard") initDashboard();
    else if (page === "consignment") initConsignment();
  });
})();
