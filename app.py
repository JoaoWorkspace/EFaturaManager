from datetime import datetime
from flask import Flask, render_template, request, jsonify, Response, send_file, send_from_directory, abort
import copy
import json
import markdown
import os
import re
import requests

app = Flask(__name__)

# ---------------------------------------------------------
# LOCAL: Directories
# ---------------------------------------------------------
CACHE_FOLDER = "./cache"
os.makedirs(CACHE_FOLDER, exist_ok=True)
ICON_FOLDER = "./icon"
os.makedirs(ICON_FOLDER, exist_ok=True)


# ---------------------------------------------------------
# API: Helpers
# ---------------------------------------------------------
def get_newest_year(data):
    years = data.get("years", {})
    if not isinstance(years, dict) or not years:
        return 0
    return max(int(y) for y in years.keys() if str(y).isdigit())


def determine_newer_file(data1, data2):
    """
    Decide which JSON is newer based on highest year.
    Fallback: data2 wins.
    """
    y1 = get_newest_year(data1)
    y2 = get_newest_year(data2)
    return (data1, data2) if y1 >= y2 else (data2, data1)


# ---------------------------------------------------------
# API: Merge JSON
# ---------------------------------------------------------
def merge_json(older, newer):
    # Start with a deep copy of the older file
    merged = copy.deepcopy(older)

    # ---------- MERGE CONTRIBUTIONS ----------
    merged.setdefault("contributions", {})

    for year, new_items in newer.get("contributions", {}).items():
        merged.setdefault("contributions", {})
        merged["contributions"].setdefault(year, [])

        # Fast lookup by Id in the merged year
        existing_by_id = {c["Id"]: c for c in merged["contributions"][year]}

        for item in new_items:
            if item["Id"] in existing_by_id:
                # Merge: newer overwrites older
                existing_by_id[item["Id"]].update(item)
            else:
                merged["contributions"][year].append(item)

    # ---------- MERGE PENDING INVOICES ----------
    merged_pending = {}

    # Add older invoices first
    for invoice in older.get("pendingInvoices", []):
        emitter = invoice.get("nipc")
        if emitter:
            merged_pending[emitter] = invoice

    # Add newer invoices, overwriting duplicates
    for invoice in newer.get("pendingInvoices", []):
        emitter = invoice.get("nipc")
        if emitter:
            merged_pending[emitter] = invoice

    # Assign merged list back
    merged["pendingInvoices"] = list(merged_pending.values())

    return merged

# ---------------------------------------------------------
# API
# ---------------------------------------------------------
@app.route("/api/merge", methods=["POST"])
def merge():
    files = list(request.files.values())
    if len(files) != 2:
        return jsonify({"error": "Exactly two files are required"}), 400

    f1, f2 = files

    older_json = json.load(f1)
    newer_json = json.load(f2)

    merged = merge_json(older_json, newer_json)
    return jsonify(merged)

@app.route("/api/save-invoices", methods=["POST"])
def save_invoices():
    payload = request.get_json()

    if not payload:
        return jsonify({"success": False, "message": "Invalid JSON body"}), 400

    filename = payload.get("filename")
    data = payload.get("data")

    if not filename or data is None:
        return jsonify({"success": False, "message": "Missing filename or data"}), 400

    # Sanitize filename
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(CACHE_FOLDER, safe_filename)

    try:
        # Proper JSON writing (NOT f.write string)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        return jsonify({
            "success": True,
            "message": f"{safe_filename} saved successfully!"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# ---------------------------------------------------------
# STATIC: Icons
# ---------------------------------------------------------
@app.route('/icons/<icon_name>.png')
def get_icon(icon_name):
    # Security check
    if '..' in icon_name or '/' in icon_name:
        abort(404)

    icon_path = os.path.join(ICON_FOLDER, f"{icon_name}.png")
    if os.path.exists(icon_path):
        return send_from_directory('./icon', f"{icon_name}.png")
    else:
        abort(404)

# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------
@app.route("/")
def index():
    with open('README.md', 'r', encoding='utf-8') as f:
        readme_md = f.read()
    readme_html = markdown.markdown(readme_md, extensions=['tables'])
    return render_template("index.html", readme_html=readme_html)

@app.route("/contributions")
def contributions_page():
    return render_template("contributions.html")

@app.route("/invoices")
def invoices_page():
    return render_template("invoices.html")

@app.route("/merge")
def merge_page():
    return render_template("merge.html")

@app.route("/userscript")
def info_page():
    return render_template("userscript.html")
# ---------------------------------------------------------
if __name__ == "__main__":
    print("Starting E-Fatura Cache Manager...")
    app.run(debug=True)
