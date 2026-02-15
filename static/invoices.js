import {
	/* GLOBAL CONFIGURATION - Influence the whole app */
	DEBUG_FLAGS,	
	/* All Logging Functionalities*/
	LogType,
	logWithTimestamp,
	/* File Upload Functionalities */ 
	createJsonUploader,	
	gatherFileMetadata,
	/* Global Snackbar */
	showSnackbar
} from '/static/base.js';

/* Step 1 - We define the values for GLOBAL CONSTANTS */
DEBUG_FLAGS.LOG_TO_CONSOLE = true;

/* Last Step: We inject the javascript listeneres/functionalities for the HTML page */
	
	document.addEventListener("DOMContentLoaded", () => {
		const picker = document.getElementById("invoicePicker");
		const container = document.querySelector(".container");
		const actions = document.querySelector(".container-actions");

		let currentFile = null;
		let currentData = null;
		let invoices = [];
		let filteredInvoices = [];

		picker.addEventListener("click", async () => {
			logWithTimestamp(LogType.DEBUG,"[Invoices] Picker clicked");
			try {
				const { file, data } = await createJsonUploader({ sideName: "Invoices" });

				logWithTimestamp(LogType.DEBUG,"Invoice File selected:", file.name, file.size, file.type);
				currentFile = file;
				logWithTimestamp(LogType.DEBUG,"Invoice Data extracted:", data.pendingInvoices);
				currentData = data;

				// ✅ metadata ONLY on picker
				const meta = gatherFileMetadata(file);
				picker.innerHTML = `
					<div class="meta">
						<span class="tag">Name: ${meta.name}</span>
						<span class="tag">Size: ${meta.size}</span>
						<span class="tag">Type: ${meta.type}</span>
						<span class="tag">Modified: ${meta.lastModified}</span>
					</div>
				`;

				if (!Array.isArray(data.pendingInvoices)) {
					throw new Error("JSON does not contain pendingInvoices array");
				}

				invoices = data.pendingInvoices.map(inv => ({
					nipc: inv.nipc,
					alias: inv.alias || "",	
					selectedOption: inv.selectedOption || "DGF",
					isConditional: Boolean(inv.isConditional)
				})).sort((a,b) => a.nipc-b.nipc);

				logWithTimestamp(LogType.DEBUG,`[Invoices] Rendering invoices: ${invoices.length}`);
				renderCards();
				renderActions();

				showSnackbar("Invoices loaded!");
			} catch (err) {
				logWithTimestamp(LogType.DEBUG,"[Invoices] Error loading file", err);
				showSnackbar("Failed to load JSON file");
			}
		});

		/* =========================
		   Rendering
		========================= */

		function renderCards() {
			container.innerHTML = "";

			// Use filteredInvoices if it has items, otherwise show all
			const toRender = filteredInvoices.length ? filteredInvoices : invoices;

			toRender.forEach((inv, idx) => {
				const card = document.createElement("div");
				card.className = "panel";

				card.innerHTML = `
					<div class="field">
						<label>NIPC</label>
					</div>
					<h3 class="invoice-title">${inv.nipc}</h3>

					<div class="field">
						<label>Alias</label>
						<input type="text" value="${inv.alias}">
					</div>

					<div class="field">
						<label>Sector</label>
						<div class="container-row">
							${renderSectorButtons(inv.selectedOption)}
						</div>
					</div>

					<div class="field inline">
						<label>Conditional</label>
						<label class="switch">
							<input type="checkbox" ${inv.isConditional ? "checked" : ""}>
							<span class="slider"></span>
						</label>
					</div>
				`;

				bindCardEvents(card, idx, toRender); // pass toRender for correct binding
				container.appendChild(card);
			});
		}


		function renderActions() {
			actions.innerHTML = `
				<input
					type="text"
					id="invoiceSearch"
					placeholder="Search by NIPC or Alias..."
					style="padding: 6px 12px; width: 60%; margin-right: 12px; border-radius: 6px; border: 1px solid #ccc;"
				>
				<button id="saveAllInvoices" style="float: right;">Save all invoices</button>
				<span id="invoiceCount" style="font-weight: 600;">Total: ${invoices.length}</span>
			`;

			const searchInput = document.getElementById("invoiceSearch");
			const invoiceCount = document.getElementById("invoiceCount");

			// -------------------------------
			// Live search
			// -------------------------------
			searchInput.addEventListener("input", (e) => {
				const query = e.target.value.toLowerCase();
				filteredInvoices = invoices.filter(inv =>
					inv.nipc.includes(query) ||
					inv.alias.toLowerCase().includes(query)
				);

				renderCards();

				// Update count
				invoiceCount.textContent = `Total: ${filteredInvoices.length}`;
			});

			// -------------------------------
			// Save all invoices
			// -------------------------------
			document.getElementById("saveAllInvoices")
				.addEventListener("click", saveAllInvoices);
		}
		
		function renderActions() {
			actions.innerHTML = `
				<input
					type="text"
					id="invoiceSearch"
					placeholder="Search by NIPC or Alias..."
					style="padding: 6px 12px; width: 60%; margin-right: 12px; border-radius: 6px; border: 1px solid #ccc;"
				>
				<button id="saveAllInvoices" style="float: right;">Save all invoices</button>
				<span id="invoiceCount"";">Total: ${invoices.length}</span>
			`;

			// Now the element exists, attach event listener
			const searchInput = document.getElementById("invoiceSearch");
			const invoiceCount = document.getElementById("invoiceCount");

			searchInput.addEventListener("input", (e) => {
				const query = e.target.value.toLowerCase();

				// Filter the invoices based on search
				filteredInvoices = invoices.filter(inv =>
					inv.nipc.includes(query) ||
					inv.alias.toLowerCase().includes(query)
				);

				// Re-render the visible cards
				renderCards();

				// Update the total count of filtered invoices
				invoiceCount.textContent = `Total: ${filteredInvoices.length}`;
			});

			// Save button listener
			document.getElementById("saveAllInvoices")
				.addEventListener("click", saveAllInvoices);
		}


		/* =========================
		   Bindings
		========================= */

		function bindCardEvents(card, idx) {
			const aliasInput = card.querySelector("input[type=text]");
			const sectorButtons = card.querySelectorAll(".sector-btn");
			const conditionalToggle = card.querySelector("input[type=checkbox]");

			aliasInput.addEventListener("input", e => {
				invoices[idx].alias = e.target.value;
			});

			sectorButtons.forEach(btn => {
				btn.addEventListener("click", () => {
					sectorButtons.forEach(b => b.classList.remove("active"));
					btn.classList.add("active");
					invoices[idx].selectedOption = btn.dataset.value;
				});
			});

			conditionalToggle.addEventListener("change", e => {
				invoices[idx].isConditional = e.target.checked;
			});
		}

/* =========================
	Save
========================= */

function saveAllInvoices() {
    logWithTimestamp(LogType.DEBUG,"[Invoices] Saving all invoices");

    if (!currentFile || !currentData) {
        showSnackbar("No JSON loaded");
        return;
    }

    const updatedPendingInvoices = invoices.map(inv => ({
        nipc: inv.nipc,
        alias: inv.alias,
        selectedOption: inv.selectedOption,
        isConditional: inv.isConditional
    }));

    const fullData = { ...currentData, pendingInvoices: updatedPendingInvoices };

    logWithTimestamp(LogType.DEBUG,"[Invoices] Full data to save:", fullData);

    fetch("/api/save-invoices", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            filename: currentFile.name,
            data: fullData
        })
    })
    .then(res => res.json())
    .then(res => showSnackbar(res.message || "Invoices saved"))
    .catch(() => showSnackbar("Error saving invoices"));
}


		/* =========================
		   Sector Buttons
		========================= */

		function renderSectorButtons(selected) {
			const sectors = [
				["C01", "atf-automoveis", "Manutenção automóveis"],
				["C02", "atf-motociclos", "Motociclos"],
				["C03", "atf-restauracao", "Restauração"],
				["C04", "atf-cabeleireiros", "Cabeleireiros"],
				["C05", "atf-saude", "Saúde"],
				["C06", "atf-educacao", "Educação"],
				["C07", "atf-habitacoes", "Imóveis"],
				["C08", "atf-lares", "Lares"],
				["C09", "atf-veterinarios", "Veterinários"],
				["C10", "atf-transportes-publicos", "Transportes"],
				["C11", "atf-ginasios", "Ginásios"],
				["C12", "atf-jornais", "Jornais"],
				["DGF", "atf-familia", "Despesas Gerais Familiares"]
			];

			return sectors.map(([value, icon, title]) => {
				const isActive = value === selected ? "active" : "";

				// If we have an icon, render an <img> pointing to Flask
				const iconHTML = icon
					? `<img src="/icons/${icon}.png" alt="${title}" class="icon">`
					: "Outro";

				return `
					<button
						type="button"
						class="sector-btn ${isActive}"
						data-value="${value}"
						title="${title}">
						${iconHTML}
					</button>
				`;
			}).join("");
		}

	});
