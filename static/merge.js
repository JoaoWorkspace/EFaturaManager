import { 
	createJsonUploader, 
	formatBytes, 
	gatherFileMetadata, 
	showSnackbar 
} from '/static/base.js';	

document.addEventListener("DOMContentLoaded", () => {	
    const leftPicker = document.getElementById("leftPicker");
    const rightPicker = document.getElementById("rightPicker");
    const mergeBtn = document.getElementById("mergeBtn");
    const resultEl = document.getElementById("result");
    const cancelBtn = document.getElementById("cancelBtn");
    const confirmBtn = document.getElementById("confirmBtn");

    let leftFile = null;
    let rightFile = null;
    let leftData = null;
    let rightData = null;
    let mergedData = null;
	
	// ---------- Start in RESET State ----------
	reset();

	document.getElementById("leftPicker").addEventListener("click", async () => {
		try {
			const { file, data } = await createJsonUploader({sideName: "Left"});
			leftFile = file;
			leftData = data;
			updatePickerMeta();
			showSnackbar("Left file loaded successfully!");
		} catch {}
	});

	document.getElementById("rightPicker").addEventListener("click", async () => {
		try {
			const { file, data } = await createJsonUploader({sideName: "Right"});
			rightFile = file;
			rightData = data;
			updatePickerMeta();
			showSnackbar("Right file loaded successfully!");
		} catch {}
	});
	
    // ---------- Helpers ----------
    function updatePickerMeta() {
		leftPicker.innerHTML = leftFile
			? `<div class="meta">
				 <span class="tag ${gatherFileMetadata(leftFile, rightFile).status.toLowerCase()}">
				   ${gatherFileMetadata(leftFile, rightFile).status}
				 </span>
				 <span class="tag">Size: ${gatherFileMetadata(leftFile, rightFile).size}</span>
				 <span class="tag">Type: ${gatherFileMetadata(leftFile, rightFile).type}</span>
				 <span class="tag">Modified: ${gatherFileMetadata(leftFile, rightFile).lastModified}</span>
			   </div>`
			: "Left file";

		rightPicker.innerHTML = rightFile
			? `<div class="meta">
				 <span class="tag ${gatherFileMetadata(rightFile, leftFile).status.toLowerCase()}">
				   ${gatherFileMetadata(rightFile, leftFile).status}
				 </span>
				 <span class="tag">Size: ${gatherFileMetadata(rightFile, leftFile).size}</span>
				 <span class="tag">Type: ${gatherFileMetadata(rightFile, leftFile).type}</span>
				 <span class="tag">Modified: ${gatherFileMetadata(rightFile, leftFile).lastModified}</span>
			   </div>`
			: "Right file";

        mergeBtn.disabled = !(leftFile && rightFile);
    }

    function handleFileSelect(e, side) {
        const file = e.target.files[0];
        if (!file) return;
        if (side === "left") leftFile = file;
        else rightFile = file;

        updatePickerMeta();
    }

    async function merge() {
        if (!leftFile || !rightFile) {
            alert("Select both files");
            return;
        }

        const form = new FormData();
        form.append("left", leftFile);
        form.append("right", rightFile);

        const res = await fetch("/api/merge", { method: "POST", body: form });
        mergedData = await res.json();

        resultEl.innerHTML = JSON.stringify(mergedData, null, 2);
        Prism.highlightAll();
        document.getElementById("modal").classList.remove("hidden");
    }

    function confirmSave() {
        const blob = new Blob([JSON.stringify(mergedData, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "merged.json";
        a.click();
        reset();
		showSnackbar("JSON merged successfully!");
    }

    function cancel() {
        document.getElementById("modal").classList.add("hidden");
    }

    function reset() {
        leftFile = null;
        rightFile = null;
        mergedData = null;
        leftPicker.innerHTML = "Left file";
        rightPicker.innerHTML = "Right file";
        mergeBtn.disabled = true;
        cancel();
    }


    // Clicking picker opens hidden input
    leftPicker.addEventListener("click", () => leftInput.click());
    rightPicker.addEventListener("click", () => rightInput.click());

    // ---------- Event Listeners ----------
    mergeBtn.addEventListener("click", merge);
    cancelBtn.addEventListener("click", cancel);
    confirmBtn.addEventListener("click", confirmSave);
});
