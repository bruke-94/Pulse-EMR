const API_BASE = "http://localhost:5000/api";

const state = {
  token: localStorage.getItem("emr_token") || "",
  user: JSON.parse(localStorage.getItem("emr_user") || "null"),
};

const loginForm = document.getElementById("login-form");
const patientForm = document.getElementById("patient-form");
const appointmentForm = document.getElementById("appointment-form");
const historyForm = document.getElementById("history-form");
const registerForm = document.getElementById("register-form");
const patientSearch = document.getElementById("patient-search");
const openRegisterBtn = document.getElementById("open-register");
const registerModal = document.getElementById("register-modal");
const closeRegisterBtn = document.getElementById("close-register");
const authMessage = document.getElementById("auth-message");
const authPanel = document.getElementById("auth-panel");
const dashboard = document.getElementById("dashboard");
const userInfo = document.getElementById("user-info");
const patientsList = document.getElementById("patients-list");
const appointmentsList = document.getElementById("appointments-list");
const historyList = document.getElementById("history-list");
const selectedPatientLabel = document.getElementById("selected-patient-label");
const historyPatientSearch = document.getElementById("historyPatientSearch");
const historyPatientOptions = document.getElementById(
  "history-patient-options",
);
const clinicalTools = document.getElementById("clinical-tools");
const encounterSelect = document.getElementById("encounterId");
const vitalsForm = document.getElementById("vitals-form");
const prescriptionForm = document.getElementById("prescription-form");
const vitalsList = document.getElementById("vitals-list");
const prescriptionsList = document.getElementById("prescriptions-list");
const refreshClinicalBtn = document.getElementById("refresh-clinical-btn");
const doctorIdInput = document.getElementById("doctorId");
const appointmentPatientSelect = document.getElementById(
  "appointmentPatientId",
);
const historyPatientSelect = document.getElementById("historyPatientId");
const clinicianIdInput = document.getElementById("clinicianId");
let patientDirectory = [];
function setSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem("emr_token", token);
  localStorage.setItem("emr_user", JSON.stringify(user));
  renderSession();
}

function clearSession() {
  state.token = "";
  state.user = null;
  localStorage.removeItem("emr_token");
  localStorage.removeItem("emr_user");
  renderSession();
}

function renderSession() {
  if (!state.token || !state.user) {
    authPanel.classList.remove("hidden");
    dashboard.classList.add("hidden");
    return;
  }

  authPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  userInfo.textContent = `Signed in as ${state.user.full_name} (${state.user.role})`;
  if (clinicalTools) {
    clinicalTools.classList.toggle(
      "hidden",
      !(state.user?.role === "doctor" || state.user?.role === "admin"),
    );
  }
  if (state.user?.role === "doctor" && doctorIdInput) {
    doctorIdInput.value = state.user.id;
    doctorIdInput.readOnly = true;
    if (clinicianIdInput) {
      clinicianIdInput.value = state.user.id;
      clinicianIdInput.readOnly = true;
    }
  } else if (doctorIdInput) {
    doctorIdInput.readOnly = false;
    if (!doctorIdInput.value) {
      doctorIdInput.value = "";
    }
    if (clinicianIdInput) {
      clinicianIdInput.readOnly = false;
      if (!clinicianIdInput.value) {
        clinicianIdInput.value = "";
      }
    }
  }
  loadPatients();
  loadAppointments();
  loadHistory();
  loadDoctors();
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = {
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setSession(data.token, data.user);
    authMessage.textContent = "";
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

patientForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = {
      mrn: document.getElementById("mrn").value,
      firstName: document.getElementById("firstName").value,
      lastName: document.getElementById("lastName").value,
      dateOfBirth: document.getElementById("dateOfBirth").value,
      sex: document.getElementById("sex").value,
      phone: document.getElementById("phone").value,
      address: document.getElementById("address").value,
    };

    await apiRequest("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    patientForm.reset();
    loadPatients();
  } catch (error) {
    alert(error.message);
  }
});

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const payload = {
      fullName: document.getElementById("reg-fullName").value,
      email: document.getElementById("reg-email").value,
      password: document.getElementById("reg-password").value,
      role: document.getElementById("reg-role").value,
    };
    await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    alert("Account created. Please login.");
    registerForm.reset();
    if (registerModal) registerModal.classList.add("hidden");
  } catch (err) {
    alert(err.message);
  }
});

// Register modal open/close
openRegisterBtn?.addEventListener("click", () => {
  if (registerModal) registerModal.classList.remove("hidden");
});
closeRegisterBtn?.addEventListener("click", () => {
  if (registerModal) registerModal.classList.add("hidden");
});
registerModal?.addEventListener("click", (e) => {
  if (e.target === registerModal) registerModal.classList.add("hidden");
});

function renderPatientOptions(patients) {
  if (!historyPatientOptions) return;

  historyPatientOptions.innerHTML = patients
    .map((patient) => {
      const label = `${patient.first_name} ${patient.last_name} (${patient.mrn})`;
      return `<option value="${label}"></option><option value="${patient.mrn}"></option>`;
    })
    .join("");
}

function resolvePatientSelection(inputValue) {
  const query = (inputValue || "").trim().toLowerCase();
  if (!query) {
    return null;
  }

  const exactMatch = patientDirectory.find((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const fullLabel = `${fullName} (${patient.mrn.toLowerCase()})`;
    return (
      patient.mrn.toLowerCase() === query ||
      fullName === query ||
      fullLabel === query
    );
  });

  if (exactMatch) {
    return exactMatch;
  }

  const partialMatches = patientDirectory.filter((patient) => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    return (
      patient.mrn.toLowerCase().includes(query) || fullName.includes(query)
    );
  });

  return partialMatches.length === 1 ? partialMatches[0] : null;
}

function syncHistoryPatientSelection(patient) {
  if (!patient) {
    if (historyPatientSelect) historyPatientSelect.value = "";
    if (historyPatientSearch) historyPatientSearch.value = "";
    if (selectedPatientLabel)
      selectedPatientLabel.textContent = "Select a patient to view history";
    if (historyList)
      historyList.innerHTML =
        '<div class="record-row">Search for a patient to view records.</div>';
    if (encounterSelect) encounterSelect.innerHTML = "";
    if (vitalsList)
      vitalsList.innerHTML =
        '<div class="record-row">Select a patient to view vitals.</div>';
    if (prescriptionsList)
      prescriptionsList.innerHTML =
        '<div class="record-row">Select a patient to view prescriptions.</div>';
    return;
  }

  if (historyPatientSelect) historyPatientSelect.value = String(patient.id);
  if (historyPatientSearch)
    historyPatientSearch.value = `${patient.first_name} ${patient.last_name} (${patient.mrn})`;
  loadHistory();
}

historyPatientSearch?.addEventListener("input", () => {
  const matchedPatient = resolvePatientSelection(historyPatientSearch.value);
  if (matchedPatient) {
    syncHistoryPatientSelection(matchedPatient);
  }
});

historyPatientSearch?.addEventListener("change", () => {
  const matchedPatient = resolvePatientSelection(historyPatientSearch.value);
  if (matchedPatient) {
    syncHistoryPatientSelection(matchedPatient);
  }
});

// Tab navigation
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".nav-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const panel = btn.dataset.panel;
    document
      .querySelectorAll(".panel-section")
      .forEach((s) => s.classList.add("hidden"));
    const el = document.getElementById(panel);
    if (el) el.classList.remove("hidden");
  });
});

// patient search filter
patientSearch?.addEventListener("input", (e) => {
  const q = (e.target.value || "").toLowerCase().trim();
  const rows = document.querySelectorAll("#patients-list .patient-row");
  rows.forEach((r) => {
    const text = r.dataset.search || "";
    if (!q || text.includes(q)) r.style.display = "";
    else r.style.display = "none";
  });
});

appointmentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = {
      patientId: Number(appointmentPatientSelect.value),
      doctorId: Number(doctorIdInput.value),
      appointmentDate: new Date(
        document.getElementById("appointmentDate").value,
      ).toISOString(),
      reason: document.getElementById("reason").value,
      status: document.getElementById("appointmentStatus").value,
    };

    await apiRequest("/appointments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    appointmentForm.reset();
    if (state.user?.role === "doctor" && doctorIdInput) {
      doctorIdInput.value = state.user.id;
    }
    loadAppointments();
  } catch (error) {
    alert(error.message);
  }
});

historyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = {
      patientId: Number(historyPatientSelect.value),
      clinicianId:
        state.user?.role === "admin"
          ? Number(document.getElementById("clinicianId").value)
          : state.user?.id || state.user?.sub,
      encounterDate: new Date(
        document.getElementById("encounterDate").value,
      ).toISOString(),
      diagnosis: document.getElementById("diagnosis").value,
      notes: document.getElementById("notes").value,
    };

    await apiRequest("/encounters", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // keep patient select value so user sees the new record
    const currentPatient = historyPatientSelect.value;
    historyForm.reset();
    if (historyPatientSelect) historyPatientSelect.value = currentPatient;
    if (state.user?.role === "doctor" && clinicianIdInput) {
      clinicianIdInput.value = state.user.id;
    }
    loadHistory();
  } catch (error) {
    alert(error.message);
  }
});

vitalsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!encounterSelect?.value) {
    alert("Select an encounter first.");
    return;
  }

  try {
    const payload = {
      temperatureC: document.getElementById("temperatureC").value || null,
      pulseBpm: document.getElementById("pulseBpm").value || null,
      respiratoryRate: document.getElementById("respiratoryRate").value || null,
      systolicBp: document.getElementById("systolicBp").value || null,
      diastolicBp: document.getElementById("diastolicBp").value || null,
      spo2Percent: document.getElementById("spo2Percent").value || null,
      recordedAt: new Date(
        document.getElementById("recordedAt").value,
      ).toISOString(),
    };

    await apiRequest(`/encounters/${encounterSelect.value}/vitals`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    vitalsForm.reset();
    loadClinicalData();
  } catch (error) {
    alert(error.message);
  }
});

prescriptionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!encounterSelect?.value) {
    alert("Select an encounter first.");
    return;
  }

  try {
    const payload = {
      medicationName: document.getElementById("medicationName").value,
      dosage: document.getElementById("dosage").value,
      frequency: document.getElementById("frequency").value,
      durationDays: Number(document.getElementById("durationDays").value),
      instructions: document.getElementById("instructions").value,
    };

    await apiRequest(`/encounters/${encounterSelect.value}/prescriptions`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    prescriptionForm.reset();
    loadClinicalData();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById("logout-btn").addEventListener("click", clearSession);
document.getElementById("refresh-btn").addEventListener("click", loadPatients);
document
  .getElementById("refresh-appointments-btn")
  .addEventListener("click", loadAppointments);
document
  .getElementById("refresh-history-btn")
  .addEventListener("click", loadHistory);
refreshClinicalBtn?.addEventListener("click", loadClinicalData);
encounterSelect?.addEventListener("change", loadClinicalData);

async function loadDoctors() {
  try {
    const data = await apiRequest("/users/doctors");
    const docs = data.data || [];
    if (doctorIdInput) {
      doctorIdInput.innerHTML = "";
      docs.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.id;
        opt.textContent = `${d.full_name} <${d.email}>`;
        doctorIdInput.appendChild(opt);
      });
      if (state.user?.role === "doctor") doctorIdInput.value = state.user.id;
    }
  } catch (err) {
    // ignore
  }
}

async function loadPatients() {
  try {
    const data = await apiRequest("/patients");
    patientDirectory = data.data || [];
    renderPatientOptions(patientDirectory);
    patientsList.innerHTML = data.data
      .map(
        (p) =>
          `<div class="patient-row" data-id="${p.id}" data-search="${(p.first_name + " " + p.last_name + " " + p.mrn).toLowerCase()}"><strong>${p.first_name} ${p.last_name}</strong><br/>MRN: ${p.mrn} | DOB: ${p.date_of_birth?.slice(0, 10)}</div>`,
      )
      .join("");
    // attach click handlers to rows to select patient and show history
    document.querySelectorAll("#patients-list .patient-row").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        // switch to history panel
        document
          .querySelectorAll(".nav-btn")
          .forEach((b) => b.classList.remove("active"));
        const hbtn = document.querySelector(
          '.nav-btn[data-panel="history-panel"]',
        );
        if (hbtn) hbtn.classList.add("active");
        document
          .querySelectorAll(".panel-section")
          .forEach((s) => s.classList.add("hidden"));
        const hist = document.getElementById("history-panel");
        if (hist) hist.classList.remove("hidden");
        const matchedPatient = patientDirectory.find(
          (patient) => String(patient.id) === String(id),
        );
        syncHistoryPatientSelection(matchedPatient || null);
      });
    });
    if (appointmentPatientSelect) {
      appointmentPatientSelect.innerHTML = "";
      data.data.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.first_name} ${p.last_name} (MRN: ${p.mrn})`;
        appointmentPatientSelect.appendChild(opt);
      });
    }
    if (historyPatientSelect) {
      historyPatientSelect.value = historyPatientSelect.value || "";
    }
  } catch (error) {
    patientsList.innerHTML = `<div class="patient-row">${error.message}</div>`;
  }
}

async function loadClinicalData() {
  if (!encounterSelect?.value) {
    if (vitalsList)
      vitalsList.innerHTML =
        '<div class="record-row">Select an encounter to view vitals.</div>';
    if (prescriptionsList)
      prescriptionsList.innerHTML =
        '<div class="record-row">Select an encounter to view prescriptions.</div>';
    return;
  }

  const encounterId = encounterSelect.value;
  try {
    const [vitalsData, prescriptionsData] = await Promise.all([
      apiRequest(`/encounters/${encounterId}/vitals`),
      apiRequest(`/encounters/${encounterId}/prescriptions`),
    ]);

    if (vitalsList) {
      vitalsList.innerHTML =
        (vitalsData.data || [])
          .map(
            (record) => `
        <div class="record-row">
          <strong>${new Date(record.recorded_at).toLocaleString()}</strong><br/>
          Temp: ${record.temperature_c ?? "-"} C | Pulse: ${record.pulse_bpm ?? "-"} bpm | RR: ${record.respiratory_rate ?? "-"}<br/>
          BP: ${record.systolic_bp ?? "-"} / ${record.diastolic_bp ?? "-"} | SpO2: ${record.spo2_percent ?? "-"}%
        </div>
      `,
          )
          .join("") || '<div class="record-row">No vital signs recorded.</div>';
    }

    if (prescriptionsList) {
      prescriptionsList.innerHTML =
        (prescriptionsData.data || [])
          .map(
            (record) => `
        <div class="record-row">
          <strong>${record.medication_name}</strong><br/>
          Dosage: ${record.dosage} | Frequency: ${record.frequency} | Duration: ${record.duration_days} days<br/>
          Instructions: ${record.instructions || "-"}
        </div>
      `,
          )
          .join("") ||
        '<div class="record-row">No prescriptions recorded.</div>';
    }
  } catch (error) {
    if (vitalsList)
      vitalsList.innerHTML = `<div class="record-row">${error.message}</div>`;
    if (prescriptionsList)
      prescriptionsList.innerHTML = `<div class="record-row">${error.message}</div>`;
  }
}

async function loadEncounterDetails(encounterId) {
  const [vitalsData, prescriptionsData] = await Promise.all([
    apiRequest(`/encounters/${encounterId}/vitals`),
    apiRequest(`/encounters/${encounterId}/prescriptions`),
  ]);

  const vitalsHtml =
    (vitalsData.data || [])
      .map(
        (record) => `
    <div class="record-row">
      <strong>${new Date(record.recorded_at).toLocaleString()}</strong><br/>
      Temp: ${record.temperature_c ?? "-"} C | Pulse: ${record.pulse_bpm ?? "-"} bpm | RR: ${record.respiratory_rate ?? "-"}<br/>
      BP: ${record.systolic_bp ?? "-"} / ${record.diastolic_bp ?? "-"} | SpO2: ${record.spo2_percent ?? "-"}%
    </div>
  `,
      )
      .join("") || '<div class="record-row">No vital signs recorded.</div>';

  const prescriptionsHtml =
    (prescriptionsData.data || [])
      .map(
        (record) => `
    <div class="record-row">
      <strong>${record.medication_name}</strong><br/>
      Dosage: ${record.dosage} | Frequency: ${record.frequency} | Duration: ${record.duration_days} days<br/>
      Instructions: ${record.instructions || "-"}
    </div>
  `,
      )
      .join("") || '<div class="record-row">No prescriptions recorded.</div>';

  return { vitalsHtml, prescriptionsHtml };
}

async function loadAppointments() {
  try {
    const data = await apiRequest("/appointments");
    appointmentsList.innerHTML = data.data
      .map(
        (appointment) =>
          `<div class="record-row"><strong>${appointment.patient_first_name} ${appointment.patient_last_name}</strong><br/>Doctor: ${appointment.doctor_name}<br/>When: ${new Date(appointment.appointment_date).toLocaleString()}<br/>Status: ${appointment.status}<br/>Reason: ${appointment.reason}</div>`,
      )
      .join("");
  } catch (error) {
    appointmentsList.innerHTML = `<div class="record-row">${error.message}</div>`;
  }
}

async function loadHistory() {
  try {
    const patientId = historyPatientSelect?.value;
    const query = patientId
      ? `?patientId=${encodeURIComponent(patientId)}`
      : "";
    const data = await apiRequest(`/encounters${query}`);
    const selectedEncounterId = encounterSelect?.value;
    const matchedPatient = patientDirectory.find(
      (patient) => String(patient.id) === String(patientId),
    );
    const patientText = matchedPatient
      ? `${matchedPatient.first_name} ${matchedPatient.last_name} (${matchedPatient.mrn})`
      : "Selected patient";
    if (selectedPatientLabel) {
      selectedPatientLabel.textContent = patientId
        ? `Records for ${patientText}`
        : "Select a patient to view history";
    }

    if (!data.data || data.data.length === 0) {
      historyList.innerHTML =
        '<div class="record-row">No history found for this patient.</div>';
      if (encounterSelect) encounterSelect.innerHTML = "";
      if (vitalsList)
        vitalsList.innerHTML =
          '<div class="record-row">No patient selected.</div>';
      if (prescriptionsList)
        prescriptionsList.innerHTML =
          '<div class="record-row">No patient selected.</div>';
      return;
    }

    const cards = await Promise.all(
      data.data.map(async (record) => {
        const details = await loadEncounterDetails(record.id);
        return `
        <div class="record-row encounter-card ${String(record.id) === String(selectedEncounterId) ? "active" : ""}" data-encounter-id="${record.id}">
          <div class="encounter-header">
            <strong>${patientText}</strong>
            <span>${new Date(record.encounter_date).toLocaleString()}</span>
          </div>
          <div class="encounter-meta">Clinician: ${record.clinician_name} | Diagnosis: ${record.diagnosis || "-"} | Notes: ${record.notes || "-"}</div>
          <div class="encounter-subsection">
            <h4>Vital Signs</h4>
            ${details.vitalsHtml}
          </div>
          <div class="encounter-subsection">
            <h4>Prescriptions</h4>
            ${details.prescriptionsHtml}
          </div>
        </div>
      `;
      }),
    );

    historyList.innerHTML = cards.join("");

    if (encounterSelect) {
      encounterSelect.innerHTML = "";
      data.data.forEach((record) => {
        const option = document.createElement("option");
        option.value = record.id;
        option.textContent = `${new Date(record.encounter_date).toLocaleString()} - ${record.clinician_name}`;
        encounterSelect.appendChild(option);
      });

      if (
        selectedEncounterId &&
        [...encounterSelect.options].some(
          (option) => option.value === selectedEncounterId,
        )
      ) {
        encounterSelect.value = selectedEncounterId;
      } else if (encounterSelect.options.length > 0) {
        encounterSelect.value = encounterSelect.options[0].value;
      }
    }

    if (encounterSelect?.value) {
      loadClinicalData();
    } else {
      if (vitalsList)
        vitalsList.innerHTML =
          '<div class="record-row">Select an encounter to view vitals.</div>';
      if (prescriptionsList)
        prescriptionsList.innerHTML =
          '<div class="record-row">Select an encounter to view prescriptions.</div>';
    }
  } catch (error) {
    historyList.innerHTML = `<div class="record-row">${error.message}</div>`;
  }
}

renderSession();
