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

/* ---------------------------------------------------------------------
 * ROW CREATION
 * -------------------------------------------------------------------*/
function createRow(sector) {
    const tr = document.createElement("tr");

    tr.appendChild(tdSector(sector));
    tr.appendChild(tdMetric(sector.Spent || 0, sector.MaximumEfficientSpending || 1, "bar-spent"));
    tr.appendChild(tdMetric(sector.Reimbursed || 0, sector.ReimburseLimit || 1, "bar-reimbursed"));

    return tr;
}

function tdMetric(value, max, barClass) {
    const td = document.createElement("td");
    const completion = ((value / max) * 100).toFixed(2);

    td.innerHTML = `
        <div class="metric">
            <div class="progress" title="${completion}%">
                <div class="progress-bar ${barClass}" style="width: ${completion}%;"></div>
            </div>
            <span class="metric-value">${value.toFixed(2)} / ${max.toFixed(2)}</span>
        </div>
    `;
    return td;
}

function tdSector(sector) {
	logWithTimestamp(LogType.INFO, `Creating row for the following sector`,sector);
    const td = document.createElement("td");
    td.className = "sector-cell";

    const rowDiv = document.createElement("div");
    rowDiv.className = "sector";

    if (sector.IconClass) {
        const icon = document.createElement("img");
        icon.className = "icon";
		icon.src = `/icons/${sector.IconClass}.png`;
        rowDiv.appendChild(icon);
    }

	if(sector.Title){
		const label = document.createElement("span");
		label.append(sector.Title);
		rowDiv.appendChild(label);	
	}


    // IVA badge
	const taxRate = ((sector.TaxRate || 0) * 100).toFixed(2);
    const taxRateBadge = createBadge(taxRate, "The maximum tax rate (%) your invoices can have when being registered to this sector", "var(--danger)");
    rowDiv.appendChild(taxRateBadge);
	
	//Reimbursement badge
	const reimburseRate = ((sector.ReimburseRate || 0) * 100).toFixed(2);
    const reimburseRateBadge = createBadge(reimburseRate, "Represents the reimbursement rate this sector provides you (more is better)");
	rowDiv.appendChild(reimburseRateBadge);

    td.appendChild(rowDiv);
    return td;
}

/* ---------------------------------------------------------------------
 * UI HELPERS
 * -------------------------------------------------------------------*/
function createBadge(rate, title, color='var(--accent)'){
	const badge = document.createElement("span");
    badge.className = "badge";
	badge.style.backgroundColor = color;
    badge.textContent = `${rate}%`;
	badge.title = title;
	return badge;
}
 
function navButton(label) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.classList.add("nav");
	return btn;
}

function createTableHeaders(headers) {
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    headers.forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        tr.appendChild(th);
    });

    thead.appendChild(tr);
    return thead;
}

/* ---------------------------------------------------------------------
 * FILE PICKER INTERACTION
 * -------------------------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
	const picker = document.getElementById("contributionsPicker");
	const container = document.querySelector(".container");
	const actions = document.querySelector(".container-actions");

	let currentFile = null;

		picker.addEventListener("click", async () => {
			logWithTimestamp(LogType.DEBUG,"[E-Fatura Contributions] Picker clicked");
			try {
				const { file, data } = await createJsonUploader({ sideName: "Contributions" });

				logWithTimestamp(LogType.DEBUG,"[E-Fatura Contributions] File selected:", file.name, file.size, file.type);
				currentFile = file;

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

				const contributionsData = data.contributions || {};
                if (!Object.keys(contributionsData).length) {
                    showSnackbar("No contributions data found in the file");
                    return;
                }
				
                populateContributionsContainer(contributionsData);
				showSnackbar("Contributions loaded!");
			} catch (err) {
				logWithTimestamp(LogType.DEBUG,"[E-Fatura Contributions]] Error loading file", err);
				showSnackbar("Failed to load JSON file");
			}
		});
});

/* ---------------------------------------------------------------------
 * POPULATE CONTAINER FROM JSON DATA
 * -------------------------------------------------------------------*/
export async function populateContributionsContainer(data) {
    const container = document.querySelector(".container");
    if (!container) return;

    container.innerHTML = "";
    const years = Object.keys(data).sort();
    if (!years.length) {
        showSnackbar("No contribution data found");
        return;
    }

    let currentIndex = years.length - 1;

    const header = document.createElement("div");
    const prevBtn = navButton();
    const nextBtn = navButton();
    const title = document.createElement("span");
    header.className = "nav";
    header.append(prevBtn, title, nextBtn);
    container.appendChild(header);

    function render() {
        const year = years[currentIndex];
        const sectors = data[year];

        title.textContent = year;
        container.innerHTML = "";

        if (!sectors?.length) {
            container.textContent = "No contribution data for this year.";
            return;
        }

        const table = document.createElement("table");
        table.appendChild(createTableHeaders(["Sector", "Spent (€)", "Reimbursed (€)"]));

        const tbody = document.createElement("tbody");
        sectors.forEach(sector => {
            tbody.appendChild(createRow(sector));
        });

        table.appendChild(tbody);
		container.appendChild(header);		
        container.appendChild(table);

		prevBtn.classList.toggle("disabled", currentIndex === 0);
		nextBtn.classList.toggle("disabled", currentIndex === years.length - 1);
    }

    prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; render(); } };
    nextBtn.onclick = () => { if (currentIndex < years.length - 1) { currentIndex++; render(); } };

    render();
}
