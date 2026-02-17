# <img src="static/logo.png" height="60" /> E-Fatura Manager

**E-Fatura Manager** is a productivity-focused web application and together with ***[E-Fatura Control Panel](/userscript)*** is designed to make managing Portuguese e-invoices (*e-Fatura*) faster, safer, and significantly less painful.

It helps you **collect, cache, review, auto-fill, and merge invoice data**, turning a repetitive bureaucratic task into a guided, data-driven workflow.

You can browse the application locally through:

```
python .\app.py
```

---

## 🚀 What This Project Solves

- The official e-Fatura website is slow and repetitive  
- Browser storage resets frequently, losing valuable invoice history  
- Invoice emitters are often hard to identify (NIPC + abstract names)  
- Sector misclassification can cause **lost reimbursements or penalties**  
- There’s no built-in way to analyze contributions across sectors over time  

**E-Fatura Manager fixes all of that.**

---

## 🔗 Important Links

### 🌐 [E-Fatura Portal: Your Contributions](https://faturas.portaldasfinancas.gov.pt/painelAdquirente.action)
- Use the Userscript here to extract your contributions into your local cache and save them as **JSON**.

### 🌐 [E-Fatura Portal: Pending Invoices](https://faturas.portaldasfinancas.gov.pt/resolverListaPendenciasAdquirenteForm.action)
- Access your pending invoices and leverage the auto-fill functionality powered by the **Userscript**.

---

# 🖥️ Web Application

The web app is where you **manage, review, merge, and analyze** your invoice data.

---

## 🧾 Invoice Management

### 📂 Manage Pending & Historical Invoices
- Load previously saved invoice cache files (JSON)
- Review invoices you’ve already submitted in the past
- Edit, re-classify, or correct invoices without reloading the official site

### 🏷️ Emitter Aliases
- Assign **human-readable aliases** to invoice emitters  
- Useful when the **NIPC + Company Name** combo is unclear or ambiguous  
- Aliases persist in cache and improve future auto-fill accuracy

---

## ⚙️ Smart Sector Configuration

### 🧰 Sector Presets
- Choose which **sectors** should be auto-filled by default
- Configuration is stored in cache and reused automatically

### ⚠️ Conditional Emitters
- Mark an invoice emitter as **Conditional**
- When conditional:
  - Auto-Fill **does NOT blindly reuse** the cached sector
  - Instead, it decides based on the **Tax Rate**:
    - Normal
    - Intermediate
    - Reduced
    - Null

This is critical because **incorrect sector selection can cause penalties during audits**, especially when reduced or null tax rates apply.

---

## 💸 Contributions Review & Tax Strategy

### 📊 Review Contributions by Sector
- Inspect how much you’ve already contributed per sector
- See which reimbursement limits are close or already maxed out

### 🧮 Smarter Financial Decisions
- Understand **where future expenses should go** to maximize reimbursement
- Avoid overloading sectors that no longer provide benefits

### 🤖 Auto-Fill with Reimbursement Awareness
- Auto-Fill prioritizes **sectors that haven’t reached reimbursement limits**
- Helps distribute expenses more efficiently across the tax year

---

## 🧠 Intelligent Auto-Fill Logic

**When no cached data exists yet:**

- Auto-Fill selects the **most valuable reimbursement option**
- Takes tax rate and sector limits into account
- Every decision is immediately:
    - Saved to cache
    - Persisted to JSON
    - Reused in future operations

The system **learns from your submissions**, improving accuracy over time.

---

## 🔀 Merge JSON Cache Files

### 📁 Why Merging Matters
Browser storage resets happen:

- On browser restarts
- On cache clears
- On different devices or sessions

**To prevent data loss:**

- Periodically export your cache as JSON
- Later, merge multiple cache files safely

### 🧬 Smart Merge Rules

This ensures your auto-fill engine keeps getting better over time.

- **Newer data always takes priority**
    - If the same emitter or configuration exists in both files  
    - The most recent version overrides the older one

- **Older data is preserved when missing**
    - Any information not present in the newer file
    - Will persist from the older cache

- **The result is a continuously growing dataset**
    - Invoice emitters
        - NIPC mappings
        - Aliases
    - Sector decisions
        - Default sector assignments
        - Conditional emitter rules
    - Auto-fill metadata
        - Tax-rate-based decisions
        - Historical user choices

This guarantees that your **auto-fill engine improves over time**, even across browser resets, devices, or long gaps between exports.

---

## 🎨 UI & Experience

- Clean, modern, responsive layout
- Tag-based metadata visualization
- File pickers, modals, panels
- Light & Dark mode via CSS variables
- Fast, lightweight, minimal dependencies

---

## 🔒 Security & Privacy

- Files are processed **locally and server-side only**
- No unnecessary external data exposure
- No tracking, no analytics, no hidden requests

---

## 📚 Philosophy

This project exists to:

- Reduce human error  
- Prevent lost reimbursements  
- Make tax compliance **predictable and data-driven**  
- Turn a bureaucratic obligation into a manageable system  

**Paying taxes doesn’t have to be painful.**  
With the right tools, it can even be… efficient.
