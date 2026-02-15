    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * DOM Tooling. Allowing me to detect changes and to manipulate the DOM. * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

/* GLOBAL CONFIGURATION */	 
export const DEBUG_FLAGS = {};
const STATIC_ELEMENTS = {};
const GLOBAL_CONFIG = {};
const ADS = [];
	 
/* Logging */
	 
export const LogType = {
	DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error"
};
export const LOG_COLORS = {
    debug: ["#B388FF", "#D1C4E9", "#F3E5F5"], // lavender shades
    info: ["#4FC3FF", "#80D8FF", "#E0E0E0"], // blue shades
    warn: ["#FFB74D", "#FFD54F", "#FFF9C4"], // orange shades
    error: ["#FF5252", "#FF8A80", "#FFCDD2"], // red shades
};

export function logToDashboard(message, timestamp, ...optionalParams){
    if(STATIC_ELEMENTS.FESCAN_DASHBOARD_LOGGING){
        const logElement = document.createElement('div');
        Style.assignImportant(logElement, {
            "display": 'flex',
            "flex-direction": 'row',
            "flex": '1'
        });

        const timestampElement = document.createElement('div');
        if(timestamp){
            Style.assignImportant(timestampElement, {
                "color": 'darkorange'
            });
             timestampElement.textContent = timestamp+" | ";
            // STATIC_ELEMENTS.FESCAN_DASHBOARD_LOGGING.appendChild(timestampElement);
        }

            const messageElement = document.createElement('div');
            Style.assignImportant(messageElement, {
                "color": 'lightgreen'
            });
            messageElement.textContent = message;


            logElement.appendChild(timestampElement);
            logElement.appendChild(messageElement);

            STATIC_ELEMENTS.FESCAN_DASHBOARD_LOGGING.appendChild(logElement);
            STATIC_ELEMENTS.FESCAN_DASHBOARD_LOGGING.scrollTop = STATIC_ELEMENTS.FESCAN_DASHBOARD_LOGGING.scrollHeight;
    }
}
	 
export function logWithTimestamp(logType, message, ...optionalParams) {
        const now = new Date();
        const formattedTimestamp =
              `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
              `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;
        const [tagColor, timeColor, messageColor] = LOG_COLORS[logType];
        if(DEBUG_FLAGS.LOG_TO_CONSOLE){
            console.log(`%c[E-Fatura Control Panel] %c${formattedTimestamp} | %c${message}`, `color: ${tagColor}; font-weight: bold;`, `color: ${timeColor}; font-weight: bold;`, `color: ${messageColor}; font-weight: bold;`, ...optionalParams,);
        }
        logToDashboard(message, formattedTimestamp);
}

    /****************************************************************************************************************************************************************
     * Simplifies removing multiple attributes from a single element.                                                                                               *
     ****************************************************************************************************************************************************************/
    export function removeAttributes(element, ...attributes) {
        attributes.forEach(attr => element.removeAttribute(attr));
    }

    export function removeFromClassList(element, ...classes) {
        if (!element || !element.classList) return;
        classes.forEach(cls => {
            if (cls && element.classList.contains(cls)) {
                element.classList.remove(cls);
            }
        });
    }

    export function addToClassList(element, ...classes) {
        if (!element || !element.classList) return;
        classes.forEach(cls => {
            if (cls && !element.classList.contains(cls)) {
                element.classList.add(cls);
            }
        });
    }

    export function getElementName(element) {
        if (!element) return 'null';
        if (element instanceof Document) return 'document';
        if (element instanceof HTMLElement) return `<${element.tagName.toLowerCase()}>`;
        return element.constructor.name;
    }

    /**
     * Clear Inner HTML
     * 1. Remove all child elements first.
     * 2. Check if a child element is part of STATIC_ELEMENTS, otherwise removes it.
     */
    export function clearInnerHtml(element){
        while (element.firstChild) {
            const elementBeingRemoved = element.firstChild;

            /* 1.*/
            element.removeChild(elementBeingRemoved);
            /* 2. */
            if(!Object.values(STATIC_ELEMENTS).includes(elementBeingRemoved)){
                elementBeingRemoved.remove();
            }
        }
    }
	
export function setInputValue(inputElement, value) {
        if (!inputElement) {
            logWithTimestamp(`[SetInputValue] ➡ Input element not found to set value: ${value}`);
            return;
        }
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(inputElement, value);
        ["input", "change"].forEach(type =>
            inputElement.dispatchEvent(new Event(type, {bubbles: true}))
        );
        logWithTimestamp(`[SetInputValue] ➡ Set value "${value}" on`, inputElement);
}
	

export function clickButton(button) {
        if (!button) {
            logWithTimestamp("[ClickButton] ➡ Button not found.");
            return false;
        }
        if (button.offsetParent === null) {
            logWithTimestamp("[ClickButton] ➡ Button is hidden or not in DOM visually yet.");
            return false;
        }

        /* Forces button clickable and reactive. */
        removeAttributes(button, 'aria-disabled', 'disabled');

        // Fix any parent that disables pointer events
        // let parent = button.parentElement;
        // while (parent) {
        //     if (window.getComputedStyle(parent).pointerEvents === 'none') {
        //         parent.style.pointerEvents = 'auto';
        //     }
        //     parent = parent.parentElement;
        // }
        const rect = button.getBoundingClientRect();
        const viewContext = button.ownerDocument?.defaultView || window;
        ["mouseover", "pointerdown", "mousedown", "focus", "pointerup", "mouseup", "blur", "click"].forEach(type =>
            button.dispatchEvent(new MouseEvent(type, { view: viewContext, bubbles: true, cancelable: true, composed: true, clientX: rect.height/2, clientY: rect.width/2 }))
        );
        logWithTimestamp(`[ClickButton] ➡ Clicked button`, button);
        return true;
    }

/**
 * Creates a reusable JSON file uploader
 * @param {Object} options
 * @param {string} options.sideName - optional label for logging/identification
 * @param {string} [options.accept=".json"] - file type filter
 * @returns {Promise<Object>} resolves with {file: File, data: Object}
 */
export function createJsonUploader({accept=".json", sideName=""} = {}) {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.style.display = "none";

        input.addEventListener("change", async (e) => {
            const file = e.target.files[0];
            if (!file) return reject(new Error("No file selected"));

            try {
                const text = await file.text();
                const data = JSON.parse(text);
                resolve({file, data});
            } catch (err) {
                showSnackbar(`Invalid JSON file${sideName ? ` (${sideName})` : ""}`);
                reject(err);
            }
        });

        document.body.appendChild(input);
        input.click();
    });
}

export function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Obtains the metadata from an uploaded file.
 * @param {File} file - The file we are extracting metadata from
 * @param {File} otherFile - optional file to compare ModifiedDate and decide the Old/New/Same Status
 * @returns {Object} with {name: string, size: string, type: string, lastModified: date, status: string}
 */
export function gatherFileMetadata(file, otherFile) {
    const name = file.name;
    const size = formatBytes(file.size);
    const type = file.type || "N/A";
    const lastModified = new Date(file.lastModified).toLocaleString();

    let status = "Old"; // default
    if (otherFile) {
        if (file.lastModified > otherFile.lastModified) status = "New";
        else if (file.lastModified === otherFile.lastModified) status = "Same";
        else status = "Old";
    }

    return { name, size, type, lastModified, status };
}

// Utility: Create a modal dialog box with a custom title and a close button.
    // If isPopup is false, any existing globalDialog is removed.
    export function createDialog(titleText, isPopup=false) {
        if (!isPopup && globalDialog) { globalDialog.remove(); }
        const dialog = document.createElement("div");
        dialog.style.display = "flex";
        dialog.style.flexDirection = "column";
        dialog.style.position = "fixed";
        dialog.style.top = "50%";
        dialog.style.left = "50%";
        dialog.style.transform = "translate(-50%, -50%)";
        dialog.style.backgroundColor = "#333";
        dialog.style.color = "#fff"; // Ensure white font
        dialog.style.borderRadius = "10px";
        dialog.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
        dialog.style.padding = "20px";
        dialog.style.width = "1200px"; // Fixed width for control panel dialogs
        dialog.style.height = "680px"; // Fixed height for control panel dialogs
        dialog.style.zIndex = "10000";
        dialog.style.overflow = "hidden";

        const title = document.createElement("h2");
        title.textContent = titleText;
        title.style.color = "#fff";
        title.style.textAlign = "center";
        dialog.appendChild(title);

        const closeButton = document.createElement("button");
        closeButton.textContent = "×";
        closeButton.style.position = "absolute";
        closeButton.style.top = "10px";
        closeButton.style.right = "10px";
        closeButton.style.border = "none";
        closeButton.style.backgroundColor = "transparent";
        closeButton.style.color = "#fff";
        closeButton.style.fontSize = "24px";
        closeButton.style.fontWeight = "bold";
        closeButton.style.padding = "5px 10px";
        closeButton.style.cursor = "pointer";
        closeButton.addEventListener("click", () => {
            dialog.remove();
        });
        dialog.appendChild(closeButton);

        document.body.appendChild(dialog);
        return dialog;
    }

export function showSnackbar(message, duration = 3000) {
    const snackbar = document.getElementById('snackbar');
    if (!snackbar) return;
    snackbar.textContent = message;
    snackbar.classList.remove('hidden');
    snackbar.classList.add('show');

    clearTimeout(snackbar._timeout);
    snackbar._timeout = setTimeout(() => {
        snackbar.classList.remove('show');
        snackbar.classList.add('hidden');
    }, duration);
}