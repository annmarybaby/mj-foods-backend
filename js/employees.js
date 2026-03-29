// ═══════════════════════════════════════════════════════════════
//  EMPLOYEE MANAGEMENT MODULE — MySQL Integration
// ═══════════════════════════════════════════════════════════════

window.initEmployees = async function() {
    const view = document.getElementById('view-employees');
    if (!view) return;

    view.innerHTML = `
        <!-- ══ LEDGER MODAL ══════════════════════════════════ -->
        <div id="salary-modal" style="display:none;position:fixed;inset:0;background:rgba(10,15,30,0.88);z-index:300;align-items:center;justify-content:center;backdrop-filter:blur(10px);">
            <div style="background:#1a2540;border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:28px;width:680px;max-height:82vh;overflow-y:auto;box-shadow:0 20px 50px rgba(0,0,0,0.5);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 id="modal-emp-name" style="font-size:1.1rem;color:#f8fafc;">Salary Ledger</h3>
                    <button onclick="document.getElementById('salary-modal').style.display='none'"
                        style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:#94a3b8;border-radius:50%;width:34px;height:34px;cursor:pointer;font-size:1rem; display:flex; align-items:center; justify-content:center;"><i data-lucide="x" style="width:16px;"></i></button>
                </div>
                <div class="table-container" style="margin-top:0;">
                    <table style="width:100%;font-size:0.88rem;">
                        <thead><tr>
                            <th>Date</th><th>Type</th>
                            <th style="text-align:right">Earned</th>
                            <th style="text-align:right">Paid</th>
                            <th style="text-align:right">Running Balance</th>
                            <th style="width:40px;"></th>
                        </tr></thead>
                        <tbody id="modal-history-body"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ══ ID PHOTO REVIEW MODAL ═══════════════════════════ -->
        <div id="id-photo-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:400;align-items:center;justify-content:center;backdrop-filter:blur(15px);">
            <div style="position:relative; width:90%; max-width:500px; text-align:center;">
                <h3 id="photo-viewer-name" style="color:white; margin-bottom:15px; font-size:1.2rem;">Employee ID</h3>
                <img id="modal-id-img" style="width:100%; border-radius:15px; border:3px solid rgba(255,255,255,0.1); box-shadow:0 0 30px rgba(0,0,0,0.5);">
                <button onclick="document.getElementById('id-photo-modal').style.display='none'"
                    style="margin-top:20px; background:white; color:black; border:none; border-radius:30px; padding:10px 25px; font-weight:700; cursor:pointer;">Close Preview</button>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-bottom: 24px;">
            <!-- ══ SECTION 1: EMPLOYEE DIRECTORY ═══════════════════════════════════ -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card" style="border-top: 4px solid #3b82f6;">
                    <div style="font-size:0.75rem;color:#3b82f6;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px; display:flex; align-items:center; gap:6px;"><i data-lucide="users" style="width:14px;"></i> Add & Manage Employees</div>
                    <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom: 15px;">
                            <div class="form-group">
                                <label style="font-size:0.78rem;color:#64748b;display:block;margin-bottom:4px;">Full Name *</label>
                                <input type="text" id="emp-name" placeholder="e.g. Rahul" style="margin:0;padding:10px 12px;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.78rem;color:#64748b;display:block;margin-bottom:4px;">Position / Role</label>
                                <input type="text" id="emp-role" placeholder="Chef / Baker" style="margin:0;padding:10px 12px;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.78rem;color:#64748b;display:block;margin-bottom:4px;">Daily Wage (₹) *</label>
                                <input type="number" id="emp-wage" placeholder="500" style="margin:0;padding:10px 12px;">
                            </div>
                            <div class="form-group">
                                <label style="font-size:0.78rem;color:#64748b;display:block;margin-bottom:4px;">Upload ID Photo</label>
                                <input type="file" id="emp-photo" accept="image/*" style="margin:0;padding:6px; font-size: 0.75rem;">
                            </div>
                        </div>
                        <button onclick="window.addEmployee()"
                            style="width:100%; background:#3b82f6;color:white;border:none;border-radius:10px;padding:12px;font-weight:700;cursor:pointer;font-family:inherit;font-size:0.95rem; display:flex; align-items:center; justify-content:center; gap:8px;">
                            <i data-lucide="user-plus" style="width:18px;"></i> Save Employee Details
                        </button>
                    </div>
                    
                    <div id="directory-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 550px; overflow-y: auto;">
                        <!-- Renders from renderEmployees() -->
                    </div>
                </div>
            </div>

            <!-- ══ SECTION 2: DAILY ATTENDANCE & PAYMENTS ═══════════════════════════════════ -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card" style="border-top: 4px solid #10b981;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <div style="font-size:0.75rem;color:#10b981;font-weight:700;text-transform:uppercase;letter-spacing:1px; display:flex; align-items:center; gap:6px;"><i data-lucide="check-square" style="width:14px;"></i> Daily Attendance Log</div>
                        <div id="attendance-date" style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Today: ${new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'long'})}</div>
                    </div>
                    
                    <div id="attendance-list" style="display: flex; flex-direction: column; gap: 12px;">
                        <!-- Renders from renderEmployees() -->
                    </div>

                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                        <div id="emp-summary-mini" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    window.renderEmployees();
}

// ─── Photo Viewer ─────────────────────────────────────────────────────────────
window.showPhotoDetails = (photo, name) => {
    if (!photo) return showToast(`No photo uploaded for ${name}`, 'info');
    document.getElementById('modal-id-img').src = photo;
    document.getElementById('photo-viewer-name').textContent = `${name}'s Identification`;
    document.getElementById('id-photo-modal').style.display = 'flex';
};

// ─── Add Employee ─────────────────────────────────────────────────────────────
window.addEmployee = async () => {
    const name      = document.getElementById('emp-name').value.trim();
    const role      = document.getElementById('emp-role').value.trim();
    const daily_wage = parseFloat(document.getElementById('emp-wage').value);
    const photoInput = document.getElementById('emp-photo');

    if (!name)                      return showToast('Please enter the employee name.', 'error');
    if (!daily_wage || daily_wage<=0) return showToast('Please enter a valid daily wage.', 'error');

    let id_photo = '';
    if (photoInput.files && photoInput.files[0]) {
        id_photo = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(photoInput.files[0]);
        });
    }

    // SAVE TO MYSQL BACKEND
    await window.DB.addEmployee({ name, role, daily_wage, id_photo });

    document.getElementById('emp-name').value = '';
    document.getElementById('emp-role').value = '';
    document.getElementById('emp-wage').value = '';
    photoInput.value = '';
    document.getElementById('emp-name').focus();

    showToast(`${name} detail saved successfully!`, 'success');
    window.renderEmployees();
};

// ─── Remove Employee ──────────────────────────────────────────────────────────
window.removeEmployee = async (empId) => {
    if (!confirm('Are you absolutely sure you want to delete this employee? ALL their profile data will be permanently removed.')) return;
    await window.DB.deleteEmployee(empId);
    showToast(`Employee deleted from database.`, 'info');
    window.renderEmployees();
};

// ─── RENDER ───────────────────────────────────────────────────────────────────
window.renderEmployees = async function() {
    const emps = await window.DB.getEmployees();
    const directoryList  = document.getElementById('directory-list');
    const attendanceList = document.getElementById('attendance-list');
    const summaryMini    = document.getElementById('emp-summary-mini');
    
    if (!directoryList || !attendanceList) return;

    // Safety: ensure emps is an array
    const employeeList = Array.isArray(emps) ? emps : [];

    if (employeeList.length === 0) {
        directoryList.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b;font-style:italic;">No records found. Start by adding an employee.</div>`;
        attendanceList.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b;font-style:italic;">No employees to log.</div>`;
        if (summaryMini) summaryMini.innerHTML = '';
        return;
    }

    // ── Render Directory Section ──
    directoryList.innerHTML = emps.map(emp => {
        const photoHtml = emp.id_photo 
            ? `<img src="${emp.id_photo}" onclick="window.showPhotoDetails('${emp.id_photo}', '${emp.name}')" style="width:50px; height:50px; border-radius:10px; object-fit:cover; border: 2px solid rgba(255,255,255,0.1); cursor:pointer;">`
            : `<div style="width:50px; height:50px; border-radius:10px; background:rgba(59,130,246,0.1); display:flex; align-items:center; justify-content:center; color:#3b82f6; font-weight:bold; border: 2px dashed rgba(59,130,246,0.2);">${emp.name[0]}</div>`;

        return `
        <div style="background:rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding:16px; border-radius:14px; display:flex; gap:15px; align-items:center;">
            ${photoHtml}
            <div style="flex:1;">
                <div style="font-weight:700;color:#f1f5f9;font-size:1.05rem;">${emp.name}</div>
                <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">${emp.role || 'Staff Member'} • <span style="color:#10b981; font-weight:600;">₹${emp.daily_wage}/day</span></div>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="window.removeEmployee('${emp.id}')"
                    title="Delete Employee"
                    style="background:rgba(239,68,68,0.08);color:#f87171;border:1px solid rgba(239,68,68,0.2);border-radius:10px;width:38px; height:38px; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                    <i data-lucide="trash-2" style="width:18px;"></i>
                </button>
            </div>
        </div>`;
    }).join('');

    // Attendance Simple List
    attendanceList.innerHTML = emps.map(emp => `
        <div style="background:rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; display:flex; align-items:center; gap:15px;">
            <div style="flex:1;">
                <div style="font-weight:700;color:#f1f5f9;font-size:0.92rem;">${emp.name}</div>
                <div style="font-size:0.75rem;color:#64748b;">MySQL Record Connected</div>
            </div>
            <div style="color:#10b981; font-weight:bold; font-size:0.8rem;">Ready</div>
        </div>`).join('');

    if (window.lucide) window.lucide.createIcons();
}

function showToast(msg, type = 'info') {
    let t = document.getElementById('emp-toast');
    if (!t) {
        t = document.createElement('div'); t.id = 'emp-toast';
        t.style.cssText = 'position:fixed;bottom:26px;right:26px;z-index:9999;padding:11px 18px;border-radius:10px;font-size:0.86rem;font-weight:600;opacity:0;transform:translateY(8px);transition:0.25s;display:flex;align-items:center;gap:8px;box-shadow:0 6px 20px rgba(0,0,0,0.35);';
        document.body.appendChild(t);
    }
    const colors = type === 'success' ? ['rgba(16,185,129,0.15)', '#34d399'] : ['rgba(239,68,68,0.15)', '#f87171'];
    t.style.background = colors[0]; t.style.color = colors[1]; t.style.border = `1px solid ${colors[1]}`;
    t.innerHTML = `<span>${msg}</span>`;
    t.style.opacity = '1'; t.style.transform = 'translateY(0)';
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(8px)'; }, 2800);
}

document.addEventListener('DOMContentLoaded', window.initEmployees);
