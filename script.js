// script.js
document.addEventListener('DOMContentLoaded', () => {
    initThemeManager();
    initMockData();
    
    // Auto-detect role and set tab if on login page
    if (window.location.pathname.includes('login.html')) {
        setupLoginTabs();
    }
});
function initThemeManager() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    const storedTheme = localStorage.getItem('eswastya_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = storedTheme || (prefersDark ? 'dark' : 'light');
    const updateUI = (theme) => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    };
    updateUI(currentTheme);
    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        updateUI(newTheme);
        localStorage.setItem('eswastya_theme', newTheme);
    });
}
function initMockData() {
    // If not initialized, set dummy data in localStorage for demo
    if (!localStorage.getItem('eswastya_initialized')) {
        const dummyDatabase = {
            patients: {
                "9876543210": {
                    id: 'P001',
                    name: 'Rahul Kumar',
                    age: 34,
                    phone: '9876543210',
                    status: 'moderate', // healthy, moderate, critical
                    bmi: 23.5,
                    lastVisit: '2023-10-15',
                    history: [
                        { disease: 'Malaria', date: '2021-08-10', status: 'Recovered' },
                        { disease: 'Fractured Arm', date: '2022-04-22', status: 'Recovered' }
                    ],
                    surgeries: [],
                    allergies: ['Dust'],
                    vaccinations: ['COVID-19 (2 Doses)', 'Tetanus'],
                    medications: [
                        { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '3 days' },
                        { name: 'Multivitamins', dosage: '1 tablet', frequency: 'Daily', duration: '30 days' }
                    ],
                    prescriptions: [
                        { id: 'RX101', date: '2023-10-15', notes: 'Advised 3 days rest and fluids.' }
                    ]
                }
            },
            doctors: {
                "doc@eswastya.org": {
                    id: 'D001',
                    name: 'Dr. Sameer Sharma',
                    email: 'doc@eswastya.org',
                    password: 'password123', // Dummy password
                    verificationStatus: 'Verified', // Pending, Verified, Rejected
                    appointments: [
                        { date: '2024-03-30', time: '10:00 AM', patient: 'Rahul Kumar', type: 'Follow up' }
                    ]
                }
            },
            blogs: [
                { id: 1, title: 'Nutrition Tips for Physical Labour', excerpt: 'Stay hydrated and consume protein rich foods to maintain energy levels...', date: '2023-11-01', url: '#' },
                { id: 2, title: 'Workplace Injury Prevention', excerpt: 'Always wear your safety gear and understand proper lifting techniques...', date: '2023-11-05', url: '#' },
                { id: 3, title: 'Mental Health during Migration', excerpt: 'It is completely okay to feel lonely. Talk to your peers and family...', date: '2023-11-10', url: '#' }
            ]
        };
        localStorage.setItem('eswastya_db', JSON.stringify(dummyDatabase));
        localStorage.setItem('eswastya_initialized', 'true');
    }
}
// Helpers for reading/writing DB
function getDB() {
    return JSON.parse(localStorage.getItem('eswastya_db')) || {};
}
function saveDB(db) {
    localStorage.setItem('eswastya_db', JSON.stringify(db));
}
// Login functionality setup
function setupLoginTabs() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role') || 'patient';
    
    // Switch to active tab based on role
    activateLoginTab(role);
    // Mock patient OTP click
    const sendOtpBtn = document.getElementById('btn-send-otp');
    if(sendOtpBtn) {
        sendOtpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const phone = document.getElementById('patient-phone').value;
            if(phone.length >= 10) {
                // Simulate OTP sent UI change
                sendOtpBtn.innerHTML = '<i class="fa-solid fa-check"></i> OTP Sent';
                sendOtpBtn.classList.replace('btn-primary', 'btn-success');
                sendOtpBtn.style.backgroundColor = 'var(--success)';
                
                // Show OTP input group
                document.getElementById('otp-group').style.display = 'flex';
                const verifyOtpBtn = document.getElementById('btn-verify-otp');
                verifyOtpBtn.style.display = 'inline-flex';
            } else {
                alert('Please enter a valid phone number format.');
            }
        });
    }
    // Patient verify OTP & login
    const verifyOtpBtn = document.getElementById('btn-verify-otp');
    if(verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const phone = document.getElementById('patient-phone').value;
            const db = getDB();
            let patient = db.patients[phone];
            
            // If patient doesn't exist, create mock minimal profile
            if(!patient) {
                patient = {
                    id: 'P' + new Date().getTime(), name: 'New User', phone: phone,
                    status: 'healthy', bmi: 0, lastVisit: '-', history: [], surgeries: [],
                    allergies: [], vaccinations: [], medications: [], prescriptions: []
                };
                db.patients[phone] = patient;
                saveDB(db);
            }
            
            // "Login" by saving active session
            sessionStorage.setItem('active_user_type', 'patient');
            sessionStorage.setItem('active_user_id', phone);
            window.location.href = 'patient-dashboard.html';
        });
    }
    // Doctor login
    const docLoginBtn = document.getElementById('btn-doc-login');
    if(docLoginBtn) {
        docLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('doc-email').value;
            const pass = document.getElementById('doc-pass').value;
            const db = getDB();
            
            const doctor = db.doctors[email];
            if(doctor && doctor.password === pass) {
                sessionStorage.setItem('active_user_type', 'doctor');
                sessionStorage.setItem('active_user_id', email);
                window.location.href = 'doctor-dashboard.html';
            } else {
                // To prevent blockers for demo, auto-login if they input anything
                if(email.length > 3 && pass.length > 3) {
                     sessionStorage.setItem('active_user_type', 'doctor');
                     sessionStorage.setItem('active_user_id', email);
                     window.location.href = 'doctor-dashboard.html';
                } else {
                    alert('Invalid credentials and not enough info for demo login.');
                }
            }
        });
    }
}
function activateLoginTab(role) {
    const tabs = document.querySelectorAll('.auth-tab');
    const patientForm = document.getElementById('form-patient');
    const doctorForm = document.getElementById('form-doctor');
    
    if(!patientForm || !doctorForm) return;
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if(tab.dataset.role === role) {
            tab.classList.add('active');
        }
    });
    if (role === 'patient') {
        patientForm.style.display = 'block';
        doctorForm.style.display = 'none';
    } else {
        patientForm.style.display = 'none';
        doctorForm.style.display = 'block';
    }
}
// --- Dashboard Rendering Logic ---
function renderPatientDashboard(userId) {
    const db = getDB();
    const patient = db.patients[userId];
    if(!patient) return;
    const greet = document.getElementById('user-greeting');
    if(greet) {
        greet.textContent = `Hello, ${patient.name}`;
        greet.style.display = 'inline';
    }
    // Health Status
    const statusText = document.getElementById('health-condition-text');
    const statusCard = document.getElementById('health-status-card');
    const statusIcon = document.getElementById('status-icon');
    
    document.getElementById('patient-bmi').innerText = patient.bmi ? patient.bmi : 'N/A';
    document.getElementById('patient-last-visit').innerText = patient.lastVisit;
    if(patient.status === 'healthy') {
        statusText.innerText = 'Healthy Condition';
        statusText.style.color = 'var(--success)';
        statusCard.style.borderTopColor = 'var(--success)';
        statusIcon.style.background = 'var(--success)';
        statusIcon.innerHTML = '<i class="fa-solid fa-heart-circle-check"></i>';
    } else if(patient.status === 'moderate') {
        statusText.innerText = 'Moderate Condition';
        statusText.style.color = 'var(--warning)';
        statusCard.style.borderTopColor = 'var(--warning)';
        statusIcon.style.background = 'var(--warning)';
        statusIcon.innerHTML = '<i class="fa-solid fa-heart-circle-exclamation"></i>';
    } else {
        statusText.innerText = 'Critical Condition';
        statusText.style.color = 'var(--danger)';
        statusCard.style.borderTopColor = 'var(--danger)';
        statusIcon.style.background = 'var(--danger)';
        statusIcon.innerHTML = '<i class="fa-solid fa-heart-circle-xmark"></i>';
    }
    // History
    const hList = document.getElementById('medical-history-list');
    if(patient.history && patient.history.length > 0) {
        hList.innerHTML = patient.history.map(h => `
            <li class="history-item">
                <div style="font-weight: 600; color: var(--text-main);">${h.disease}</div>
                <small>${h.date} - ${h.status}</small>
            </li>
        `).join('');
    }
    // Meds
    const mList = document.getElementById('medications-list');
    if(patient.medications && patient.medications.length > 0) {
        mList.innerHTML = patient.medications.map(m => `
            <div class="med-card">
                <div>
                    <h4 style="margin-bottom: 0.25rem;">${m.name} <span class="badge badge-success" style="font-size: 0.75rem; vertical-align: middle; margin-left: 0.5rem;">${m.dosage}</span></h4>
                    <small style="color: var(--text-muted);">${m.frequency} • ${m.duration}</small>
                </div>
                <i class="fa-solid fa-capsules" style="color: var(--text-muted); font-size: 1.5rem;"></i>
            </div>
        `).join('');
    }
    renderHealthBlogs('patient');
}
function renderDoctorDashboard(docId) {
    const db = getDB();
    const doc = db.doctors[docId];
    if(!doc) return;
    const greet = document.getElementById('doc-greeting');
    if(greet) {
        greet.textContent = `Dr. ${doc.name.replace('Dr. ', '')}`;
        greet.style.display = 'inline';
    }
    // Verification
    const banner = document.getElementById('verification-banner');
    const badge = document.getElementById('banner-badge');
    if(doc.verificationStatus === 'Verified') {
        banner.className = 'verification-banner verified';
        badge.className = 'badge badge-success';
        badge.innerHTML = '<i class="fa-solid fa-check-circle"></i> Verified';
    }
    // Patients Table
    const pBody = document.getElementById('patient-table-body');
    let pHTML = '';
    for(const [phone, p] of Object.entries(db.patients)) {
        let rowClass = 'row-healthy';
        let badgeClass = 'badge-success';
        if(p.status === 'moderate') { rowClass = 'row-moderate'; badgeClass = 'badge-warning'; }
        if(p.status === 'critical') { rowClass = 'row-critical'; badgeClass = 'badge-danger'; }
        pHTML += `
            <tr>
                <td class="${rowClass}">
                    <strong>${p.name}</strong><br>
                    <small>${p.age} Yrs | ${p.phone}</small>
                </td>
                <td><span class="badge ${badgeClass}">${p.status.toUpperCase()}</span></td>
                <td>${p.lastVisit}</td>
                <td>
                    <button class="action-btn" title="View Profile" onclick="alert('Viewing patient ID: ${p.id}')"><i class="fa-solid fa-eye"></i></button>
                    <button class="action-btn" title="Edit Records" onclick="requestEditPatient('${p.phone}')"><i class="fa-solid fa-pen-to-square"></i></button>
                </td>
            </tr>
        `;
    }
    if(pBody) pBody.innerHTML = pHTML;
    // Appointments
    const aList = document.getElementById('appointments-list');
    if(doc.appointments && doc.appointments.length > 0) {
        aList.innerHTML = doc.appointments.map(a => `
            <li class="history-item" style="border-left-color: var(--primary);">
                <div style="font-weight: 600; color: var(--text-main);">${a.patient}</div>
                <small>${a.date} at ${a.time} - ${a.type}</small>
            </li>
        `).join('');
    }
    renderHealthBlogs('doctor');
}
function renderHealthBlogs(role) {
    const db = getDB();
    let containerId = role === 'patient' ? 'blogs-list' : 'doctor-blogs-list';
    const bList = document.getElementById(containerId);
    if(!bList) return;
    if(db.blogs && db.blogs.length > 0) {
        bList.innerHTML = db.blogs.map(b => `
            <a href="${b.url}" class="blog-card" style="display: block;">
                <h4 style="margin-bottom: 0.25rem;">${b.title}</h4>
                <p style="font-size: 0.9rem; margin-bottom: 0.75rem;">${b.excerpt}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 0.5rem;">
                    <small style="color: var(--text-muted);">${b.date}</small>
                    ${role === 'doctor' ? '<span style="color: var(--danger); font-size: 0.9rem;" onclick="event.preventDefault(); alert(\'Blog deleted\')">Delete <i class="fa-solid fa-trash"></i></span>' : '<span style="color: var(--primary); font-size: 0.9rem;">Read More &rarr;</span>'}
                </div>
            </a>
        `).join('');
    } else {
        bList.innerHTML = '<p class="form-label">No health blogs available.</p>';
    }
}
