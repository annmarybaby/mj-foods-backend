// ═══════════════════════════════════════════════════════════════
//  EMPLOYEE MANAGEMENT MODULE — MySQL Integration
// ═══════════════════════════════════════════════════════════════

const DEFAULT_EMPLOYEE_NAMES = ['Joby', 'Biju', 'Joy', 'Akash', 'Rajesh', 'Shiva'];

async function ensureDefaultEmployees() {
    const employees = await window.DB.getEmployees();
    const existingNames = new Set((Array.isArray(employees) ? employees : []).map(emp => String(emp.name || '').toLowerCase()));

    for (const name of DEFAULT_EMPLOYEE_NAMES) {
        if (!existingNames.has(name.toLowerCase())) {
            await window.DB.addEmployee({
                name,
                role: 'Staff',
                phone: '',
                salary_type: 'Daily',
                base_salary: 0,
                id_photo: ''
            });
        }
    }
}

window.initEmployees = async function() {
    const view = document.getElementById('view-employees');
    if (!view) return;

    await ensureDefaultEmployees();

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

        <div class="employee-layout-grid" style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 24px; margin-bottom: 24px;">
            <!-- ══ SECTION 1: EMPLOYEE DIRECTORY ═══════════════════════════════════ -->
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card" style="border-top: 4px solid #3b82f6;">
                    <div style="font-size:0.75rem;color:#3b82f6;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px; display:flex; align-items:center; gap:6px;"><i data-lucide="users" style="width:14px;"></i> Add & Manage Employees</div>
                    <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
                        <div style="margin-bottom: 15px;">
                            <label style="font-size:0.78rem;color:#64748b;display:block;margin-bottom:8px;">Quick Employee Names</label>
                            <div style="display:flex;gap:8px;flex-wrap:wrap;">
                                ${DEFAULT_EMPLOYEE_NAMES.map(name => `
                                    <button type="button" onclick="window.fillEmployeeName('${name}')" style="background:rgba(59,130,246,0.08); color:#bfdbfe; border:1px solid rgba(59,130,246,0.2); border-radius:999px; padding:8px 12px; font-size:0.8rem; font-weight:700; cursor:pointer;">${name}</button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="employee-form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-bottom: 15px;">
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
                                <label style="font-size:0.78rem;color:#64748b;display:block;margin-bottom:4px;">Phone Number</label>
                                <input type="tel" id="emp-phone" placeholder="+91 9876543210" style="margin:0;padding:10px 12px;">
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
                    <div class="table-container" style="margin-top:18px;">
                        <table style="width:100%; font-size:0.86rem;">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Phone</th>
                                    <th style="text-align:right;">Daily Wage</th>
                                    <th style="text-align:right;">Paid Today</th>
                                </tr>
                            </thead>
                            <tbody id="employee-details-body"></tbody>
                        </table>
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

window.fillEmployeeName = (name) => {
    const input = document.getElementById('emp-name');
    if (!input) return;
    input.value = name;
    input.focus();
};

// ─── Add Employee ─────────────────────────────────────────────────────────────
window.addEmployee = async () => {
    const name      = document.getElementById('emp-name').value.trim();
    const role      = document.getElementById('emp-role').value.trim();
    const dailyWage = parseFloat(document.getElementById('emp-wage').value || 0);
    const phone     = document.getElementById('emp-phone').value.trim();
    const photoInput = document.getElementById('emp-photo');

    if (!name)                      return showToast('Please enter the employee name.', 'error');
    if (dailyWage < 0) return showToast('Please enter a valid daily wage.', 'error');

    let id_photo = '';
    if (photoInput.files && photoInput.files[0]) {
        id_photo = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(photoInput.files[0]);
        });
    }

    // SAVE TO MYSQL BACKEND
    await window.DB.addEmployee({
        name,
        role,
        phone,
        salary_type: 'Daily',
        base_salary: dailyWage,
        id_photo
    });

    document.getElementById('emp-name').value = '';
    document.getElementById('emp-role').value = '';
    document.getElementById('emp-wage').value = '';
    document.getElementById('emp-phone').value = '';
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

window.editEmployee = async (empId) => {
    const employees = await window.DB.getEmployees();
    const emp = employees.find(item => String(item.id) === String(empId));
    if (!emp) return;

    const nextName = prompt('Edit employee name', emp.name || '');
    if (nextName === null) return;
    const nextRole = prompt('Edit role', emp.role || 'Staff');
    if (nextRole === null) return;
    const nextPhone = prompt('Edit phone number', emp.phone || '');
    if (nextPhone === null) return;
    const nextWage = prompt('Edit daily wage', emp.base_salary || 0);
    if (nextWage === null) return;

    await window.DB.updateEmployee(empId, {
        name: nextName.trim() || emp.name,
        role: nextRole.trim() || 'Staff',
        phone: nextPhone.trim(),
        salary_type: emp.salary_type || 'Daily',
        base_salary: parseFloat(nextWage || emp.base_salary || 0),
        id_photo: emp.id_photo || ''
    });

    showToast('Employee details updated.', 'success');
    window.renderEmployees();
};

// ─── RENDER ───────────────────────────────────────────────────────────────────
window.renderEmployees = async function() {
    const emps = await window.DB.getEmployees();
    const ledger = await window.DB.getLedger();
    const directoryList  = document.getElementById('directory-list');
    const attendanceList = document.getElementById('attendance-list');
    const summaryMini    = document.getElementById('emp-summary-mini');
    const detailsBody    = document.getElementById('employee-details-body');
    
    if (!directoryList || !attendanceList || !detailsBody) return;

    // Safety: ensure emps is an array
    const employeeList = Array.isArray(emps) ? emps : [];
    const todayKey = new Date().toLocaleDateString('en-IN');
    const ledgerEntries = Array.isArray(ledger) ? ledger : [];

    const paidTodayByEmployee = ledgerEntries.reduce((acc, entry) => {
        const matchesToday = entry.date_str === todayKey || new Date(entry.timestamp).toLocaleDateString('en-IN') === todayKey;
        if (!matchesToday) return acc;
        const key = String(entry.emp_id || entry.emp_name || '').toLowerCase();
        acc[key] = (acc[key] || 0) + (parseFloat(entry.paid || 0) || 0);
        return acc;
    }, {});

    if (employeeList.length === 0) {
        directoryList.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b;font-style:italic;">No records found. Start by adding an employee.</div>`;
        attendanceList.innerHTML = `<div style="padding:40px;text-align:center;color:#64748b;font-style:italic;">No employees to log.</div>`;
        detailsBody.innerHTML = '';
        if (summaryMini) summaryMini.innerHTML = '';
        return;
    }

    function cardHtml(emp) {
        const todayPaid = paidTodayByEmployee[String(emp.id).toLowerCase()] || paidTodayByEmployee[String(emp.name || '').toLowerCase()] || 0;
        return `<div class="card employee-card" style="border-left: 4px solid #3b82f6; border-radius: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:15px;">
                <div style="display:flex; gap:12px; align-items:center;">
                    <div class="avatar" style="width:45px; height:45px; border-radius:12px; background:rgba(59,130,246,0.1); display:flex; align-items:center; justify-content:center; color:#3b82f6; font-weight:700;">${emp.name.charAt(0)}</div>
                    <div>
                        <h3 style="margin:0; font-size:1.1rem; color:#fff;">${emp.name}</h3>
                        <span style="font-size:0.75rem; color:#64748b; font-weight:600; text-transform:uppercase;">${emp.role || 'Staff'}</span>
                        <div style="font-size:0.78rem; color:#93c5fd; margin-top:4px;">${emp.phone || 'Phone not added'}</div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:1rem; font-weight:800; color:#10b981;">₹${parseFloat(emp.base_salary || emp.daily_wage || 0).toLocaleString('en-IN')}</div>
                    <div style="font-size:0.7rem; color:#64748b;">Daily Wage</div>
                </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.18); border-radius:12px; padding:10px 12px; margin-bottom:14px;">
                <span style="font-size:0.75rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Paid Today</span>
                <span style="font-size:1rem; color:#34d399; font-weight:900;">₹${todayPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style="margin-top:20px; padding-top:15px; border-top:1px solid rgba(255,255,255,0.05); display:flex; gap:10px;">
                <button class="btn btn-secondary btn-sm" onclick="window.viewAttendance('${emp.id}')" style="flex:1; padding:8px; border-radius:8px; border:none; background:rgba(255,255,255,0.05); color:#fff; cursor:pointer;"><i data-lucide="calendar" style="width:14px;"></i> Attend</button>
                <button class="btn btn-secondary btn-sm" onclick="window.viewPayments('${emp.id}')" style="flex:1; padding:8px; border-radius:8px; border:none; background:rgba(255,255,255,0.05); color:#fff; cursor:pointer;"><i data-lucide="wallet" style="width:14px;"></i> Pay</button>
                <button class="btn btn-secondary btn-sm" onclick="window.editEmployee('${emp.id}')" style="padding:8px 12px; border-radius:8px; border:none; background:rgba(59,130,246,0.1); color:#93c5fd; cursor:pointer;"><i data-lucide="pencil" style="width:14px;"></i></button>
                <button class="btn btn-icon btn-sm" onclick="window.removeEmployee('${emp.id}')" style="padding:8px; border-radius:8px; border:none; background:rgba(239,68,68,0.1); color:#ef4444; cursor:pointer;"><i data-lucide="trash-2" style="width:14px;"></i></button>
            </div>
        </div>`;
    }

    // ── Render Directory Section ──
    directoryList.innerHTML = emps.map(emp => cardHtml(emp)).join('');

    // Attendance Simple List
    attendanceList.innerHTML = emps.map(emp => {
        const todayPaid = paidTodayByEmployee[String(emp.id).toLowerCase()] || paidTodayByEmployee[String(emp.name || '').toLowerCase()] || 0;
        return `
        <div style="background:rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.03); padding:12px 16px; border-radius:12px; display:flex; align-items:center; gap:15px;">
            <div style="flex:1;">
                <div style="font-weight:700;color:#f1f5f9;font-size:0.92rem;">${emp.name}</div>
                <div style="font-size:0.75rem;color:#64748b;">${emp.phone || 'No phone'} · Today paid ₹${todayPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; min-width:260px;">
                <input type="number" id="emp-paid-${emp.id}" placeholder="Paid today" value="${todayPaid || ''}" style="padding:10px 12px; margin:0; min-width:110px;">
                <button onclick="window.saveDailyPayment('${emp.id}')" style="background:#10b981; color:white; border:none; border-radius:10px; padding:10px 12px; font-weight:700; cursor:pointer;">Save</button>
            </div>
        </div>`;
    }).join('');

    detailsBody.innerHTML = employeeList.map(emp => {
        const todayPaid = paidTodayByEmployee[String(emp.id).toLowerCase()] || paidTodayByEmployee[String(emp.name || '').toLowerCase()] || 0;
        return `
            <tr>
                <td>${emp.name}</td>
                <td>${emp.role || 'Staff'}</td>
                <td>${emp.phone || '-'}</td>
                <td style="text-align:right;">₹${parseFloat(emp.base_salary || emp.daily_wage || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td style="text-align:right; color:#34d399; font-weight:700;">₹${todayPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
        `;
    }).join('');

    if (summaryMini) {
        summaryMini.innerHTML = employeeList.map(emp => {
            const todayPaid = paidTodayByEmployee[String(emp.id).toLowerCase()] || paidTodayByEmployee[String(emp.name || '').toLowerCase()] || 0;
            return `<span style="padding:8px 10px; border-radius:999px; background:rgba(59,130,246,0.08); color:#bfdbfe; font-size:0.75rem; font-weight:700;">${emp.name}: ₹${todayPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
        }).join('');
    }

    if (window.lucide) window.lucide.createIcons();
}

window.saveDailyPayment = async (empId) => {
    const employees = await window.DB.getEmployees();
    const ledger = await window.DB.getLedger();
    const emp = employees.find(item => String(item.id) === String(empId));
    if (!emp) return showToast('Employee not found.', 'error');

    const input = document.getElementById(`emp-paid-${empId}`);
    const paid = parseFloat(input?.value || 0);
    if (paid < 0) return showToast('Enter a valid paid amount.', 'error');

    const dateStr = new Date().toLocaleDateString('en-IN');
    const existingEntry = (Array.isArray(ledger) ? ledger : []).find(entry =>
        String(entry.emp_id) === String(emp.id) &&
        (entry.date_str === dateStr || new Date(entry.timestamp).toLocaleDateString('en-IN') === dateStr)
    );

    const payload = {
        emp_id: emp.id,
        emp_name: emp.name,
        date_str: dateStr,
        attendance: 'Present',
        paid,
        timestamp: Date.now()
    };

    if (existingEntry) {
        await window.DB.updateLedgerEntry(existingEntry.id, payload);
    } else {
        await window.DB.addLedgerEntry(payload);
    }

    showToast(`Saved today's payment for ${emp.name}.`, 'success');
    window.renderEmployees();
    if (window.refreshDashboard) window.refreshDashboard();
};

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
