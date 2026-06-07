const SUPABASE_URL = "https://madnbhxirczgzwhpqmio.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_CGg3mfoZyaR00fTOJf7RcQ_SLXwILni";
const DESTINATION_URL = "https://cacheta.app.link/3H1s6n";

const openTrigger = document.getElementById("openLeadForm");
const modal = document.getElementById("leadModal");
const form = document.getElementById("leadForm");
const status = document.getElementById("leadStatus");
const nameInput = document.getElementById("leadName");
const phoneInput = document.getElementById("leadPhone");

function openModal() {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  window.setTimeout(() => nameInput.focus(), 50);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  openTrigger.focus();
}

function normalizePhone(value) {
  return value.replace(/\D+/g, "");
}

function formatPhone(value) {
  const digits = normalizePhone(value).slice(0, 11);

  if (digits.length === 0) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function setStatus(message, type) {
  status.textContent = message;
  status.dataset.state = type;
}

function setSubmitting(isSubmitting) {
  form.classList.toggle("is-submitting", isSubmitting);
  form.querySelector(".lead-form__submit").disabled = isSubmitting;
}

function openDestination() {
  const destination = window.open(DESTINATION_URL, "_blank", "noopener,noreferrer");

  if (!destination) {
    window.location.href = DESTINATION_URL;
  }
}

async function saveLeadToSupabase(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Não foi possível salvar o lead.");
  }
}

openTrigger.addEventListener("click", (event) => {
  event.preventDefault();
  openModal();
});

phoneInput.addEventListener("input", () => {
  const previousLength = phoneInput.value.length;
  phoneInput.value = formatPhone(phoneInput.value);

  if (phoneInput.value.length > previousLength) {
    phoneInput.setSelectionRange(phoneInput.value.length, phoneInput.value.length);
  }
});

modal.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const phone = normalizePhone(phoneInput.value);

  if (!name || phone.length < 10) {
    setStatus("Preencha nome e telefone válidos.", "error");
    return;
  }

  setStatus("Enviando...", "loading");
  setSubmitting(true);

  try {
    await saveLeadToSupabase({
      name,
      phone,
    });

    setStatus("Tudo certo. Abrindo a Play Store...", "success");
    window.setTimeout(() => {
      openDestination();
    }, 700);
  } catch (error) {
    setStatus("Não foi possível salvar agora. Tente novamente.", "error");
    console.error(error);
  } finally {
    setSubmitting(false);
  }
});
