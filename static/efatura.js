import { clickButton, debugConsole } from '/static/base.js';	

document.addEventListener("DOMContentLoaded", () => {
	const link = document.getElementById("redirect-link");
	link.href = "https://faturas.portaldasfinancas.gov.pt";
	link.target = "_blank"; 
	clickButton(link);
	debugConsole("[E-Fatura] Opening E-Fatura Portal...");		
});
