const API_BASE = "https://c2bnbljfi9.execute-api.ap-south-1.amazonaws.com";

// ---------- Helper functions ----------
function getToken() {
  return localStorage.getItem("token");
}

function getEmail() {
  return localStorage.getItem("email");
}

function setAuth(email, token) {
  localStorage.setItem("email", email);
  localStorage.setItem("token", token);
}

function clearAuth() {
  localStorage.removeItem("email");
  localStorage.removeItem("token");
}

// ---------- UI helpers ----------
function showFileSection() {
  document.getElementById("authSection").style.display = "none";
  document.getElementById("fileSection").style.display = "block";
  loadFiles();
}

function showAuthSection() {
  document.getElementById("authSection").style.display = "block";
  document.getElementById("fileSection").style.display = "none";
}

// ---------- Auth: Signup ----------
async function signup() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Signup successful!");
      setAuth(email, data.token);
      showFileSection();
    } else {
      alert(data.error || "Signup failed");
    }
  } catch (err) {
    console.error(err);
    alert("Error while signing up");
  }
}

// ---------- Auth: Login ----------
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Login successful!");
      setAuth(email, data.token);
      showFileSection();
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("Error while logging in");
  }
}

// ---------- Upload file ----------
async function uploadFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first!");
    return;
  }

  const email = getEmail();
  const token = getToken();

  if (!email || !token) {
    alert("You must be logged in");
    showAuthSection();
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("email", email);

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert("File uploaded successfully!");
      fileInput.value = "";
      loadFiles();
    } else {
      alert("Upload failed: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("Error while uploading file");
  }
}

// ---------- Load files ----------
async function loadFiles() {
  const email = getEmail();
  const token = getToken();

  if (!email || !token) {
    return;
  }

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(
      `${API_BASE}/files?email=${encodeURIComponent(email)}`,
      { headers }
    );

    const files = await res.json();

    if (res.ok) {
      renderFiles(files);
    } else {
      alert(files.error || "Failed to load files");
    }
  } catch (err) {
    console.error(err);
    alert("Error while loading files");
  }
}

// ---------- Render files list ----------
function renderFiles(files) {
  const list = document.getElementById("files");
  list.innerHTML = "";

  if (!files || files.length === 0) {
    list.innerHTML = "<li class='empty'>No files uploaded yet.</li>";
    return;
  }

  files.forEach((file) => {
    const li = document.createElement("li");
    li.className = "file-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = file.file_name || "Unnamed file";

    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "file-buttons";

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.className = "btn download";
    downloadBtn.onclick = () => {
      window.open(file.url, "_blank");
    };

    const copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy";
    copyBtn.className = "btn copy";
    copyBtn.onclick = () => copyLink(file.url);

    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";
    shareBtn.className = "btn share";
    shareBtn.onclick = () => shareFile(file.url);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn delete";
    deleteBtn.onclick = () => deleteFile(file.file_id);

    buttonsDiv.appendChild(downloadBtn);
    buttonsDiv.appendChild(copyBtn);
    buttonsDiv.appendChild(shareBtn);
    buttonsDiv.appendChild(deleteBtn);

    li.appendChild(nameSpan);
    li.appendChild(buttonsDiv);
    list.appendChild(li);
  });
}

// ---------- Copy link ----------
function copyLink(url) {
  if (!url) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(
      () => alert("Link copied to clipboard!"),
      () => alert("Failed to copy link")
    );
  } else {
    alert("Copy not supported on this device");
  }
}

// ---------- Share link ----------
function shareFile(url) {
  if (!url) return;

  if (navigator.share) {
    navigator
      .share({
        title: "Smart Drive File",
        text: "Here is the file link:",
        url: url,
      })
      .catch((err) => console.log("Share cancelled:", err));
  } else {
    alert("Sharing is not supported on this device.");
  }
}

// ---------- Delete file ----------
async function deleteFile(fileId) {
  const email = getEmail();
  const token = getToken();

  if (!email || !token) {
    alert("You must be logged in");
    showAuthSection();
    return;
  }

  if (!confirm("Are you sure you want to delete this file?")) {
    return;
  }

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(
      `${API_BASE}/delete/${encodeURIComponent(
        fileId
      )}?email=${encodeURIComponent(email)}`,
      {
        method: "DELETE",
        headers,
      }
    );

    const data = await res.json();

    if (res.ok) {
      alert("File deleted successfully!");
      loadFiles();
    } else {
      alert(data.error || "Failed to delete file");
    }
  } catch (err) {
    console.error(err);
    alert("Error while deleting file");
  }
}

// ---------- Logout ----------
function logout() {
  clearAuth();
  showAuthSection();
}

// ---------- On page load ----------
window.addEventListener("load", () => {
  const token = getToken();
  const email = getEmail();

  if (token && email) {
    showFileSection();
  } else {
    showAuthSection();
  }
});

// ---------- Wire buttons ----------
document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const uploadBtn = document.getElementById("uploadBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (signupBtn) signupBtn.addEventListener("click", signup);
  if (loginBtn) loginBtn.addEventListener("click", login);
  if (uploadBtn) uploadBtn.addEventListener("click", uploadFile);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
