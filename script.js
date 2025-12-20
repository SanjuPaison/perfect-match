let ephemeris = [];
let submissions = JSON.parse(localStorage.getItem("submissions") || "[]");

fetch("ephemeris.csv")
  .then(r => r.text())
  .then(t => {
    const rows = t.trim().split("\n").slice(1);
    rows.forEach(r => {
      const [dt, sun, moon, venus] = r.split(",");
      ephemeris.push({
        dt: new Date(dt),
        date: dt.slice(0, 10),
        sun: +sun,
        moon: +moon,
        venus: +venus
      });
    });
  });

function angle(a, b) {
  let d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

function isMatch(d) {
  return Math.abs(d - 0) <= 8 || Math.abs(d - 120) <= 8;
}

function submitUser() {
  const emailVal = email.value.trim().toLowerCase();
  const gender = document.getElementById("gender").value;

  if (!emailVal || !date.value || !time.value) return;

  const today = new Date().toISOString().slice(0, 10);
  if (submissions.some(s => s.email === emailVal && s.day === today)) {
    results.innerHTML = "<p>You have already submitted today.</p>";
    return;
  }

  submissions.push({ email: emailVal, day: today });
  localStorage.setItem("submissions", JSON.stringify(submissions));

  document.getElementById("submitBtn").disabled = true;

  const dt = new Date(date.value + "T" + time.value + ":00Z");
  const baseRow = nearestRow(dt);

  findAllMatches(baseRow, gender);
}

function nearestRow(target) {
  return ephemeris.reduce((a, b) =>
    Math.abs(a.dt - target) < Math.abs(b.dt - target) ? a : b
  );
}

function findAllMatches(base, gender) {
  let matches = new Set();

  ephemeris.forEach(r => {
    let a1, a2;

    if (gender === "male") {
      a1 = angle(base.sun, r.venus);
      a2 = angle(r.moon, base.venus);
    } else {
      a1 = angle(r.sun, base.venus);
      a2 = angle(base.moon, r.venus);
    }

    if (isMatch(a1) && isMatch(a2)) {
      matches.add(r.date);
    }
  });

  const list = [...matches].sort();

  if (!list.length) {
    results.innerHTML =
      "<p>No perfect matches found in the current date range.</p>";
  } else {
    results.innerHTML =
      "<p><strong>Perfect match birth dates:</strong></p>" +
      list.map(d => `<p>${d}</p>`).join("") +
      "<p>You’ll be notified if anyone with these birth dates is added on this site.</p>";
  }
}
