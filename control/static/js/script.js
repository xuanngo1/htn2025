
// Sensor light
function fetchLightData() {
    fetch('/api/light/')
        .then(response => response.json())
        .then(data => {
            document.getElementById("light-value").innerText = data.light;
        });
}
setInterval(fetchLightData, 2000);

// Dashboard: Điều khiển bằng giọng nói (giả lập)
// Dashboard: Điều khiển bằng giọng nói


function sendCommand(command) {
    fetch('/api/led/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command })
    });
}

function startVoiceControl() {
    const result = document.getElementById('voice-result');
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        result.textContent = 'Đang lắng nghe...';
    };
    recognition.start();
    recognition.onresult = function(event) {
        const voiceText = event.results[0][0].transcript.toLowerCase();
        console.log("Bạn nói: ", voiceText);
        result.textContent = `Đã nhận lệnh: ${voiceText}`;

        if (voiceText.includes("đi ngủ")) sendCommand("Đi ngủ");
        else if (voiceText.includes("làm việc")) sendCommand("Làm việc");
        else if (voiceText.includes("ăn cơm")) sendCommand("Ăn cơm");
        else if (voiceText.includes("giải trí")) sendCommand("Giải trí");
        else if (voiceText.includes("xem phim")) sendCommand("Xem phim");
        else if (voiceText.includes("bật")) sendCommand("Bật");
        else if (voiceText.includes("tắt")) sendCommand("Tắt");
    };
    recognition.onerror = function(event) {
        result.textContent = 'Lỗi: ' + event.error;
    };
        
    recognition.onend = function() {
        if (result.textContent === 'Đang lắng nghe...') {
            result.textContent = 'Không nhận diện được lệnh!';
        }
    };
    
}
// Dashboard: Điều khiển đèn
let isLightOn = false;
function toggleLight() {
    isLightOn = !isLightOn;
    const button = document.getElementById('toggle-light');
    button.textContent = isLightOn ? 'Tắt đèn' : 'Bật đèn';
    
    const command = isLightOn ? 'Bật' : 'Tắt';
    sendCommand(command);
    
    addHistory(command + ' đèn', document.getElementById('current-mode').textContent);
}


// Dashboard: Chọn chế độ
function changeMode() {
    const mode = document.getElementById('mode-select').value;
    let modeText = '';
    let modeDescription = '';
    switch (mode) {
        case 'dinner':
            modeText = 'Đèn ăn cơm';
            modeDescription = 'Ánh sáng ấm áp, tạo không khí gia đình.';
            sendCommand('Ăn cơm');
            break;
        case 'work':
            modeText = 'Đèn làm việc';
            modeDescription = 'Ánh sáng trắng, tập trung cao độ.';
            sendCommand('Làm việc');
            break;
        case 'movie':
            modeText = 'Đèn xem phim';
            modeDescription = 'Ánh sáng mờ, tăng trải nghiệm xem phim.';
            sendCommand('Xem phim');
            break;
        case 'sleep':
            modeText = 'Đèn đi ngủ';
            modeDescription = 'Ánh sáng dịu nhẹ, giúp thư giãn.';
            sendCommand('Đi ngủ');
            break;
        case 'entertainment':
            modeText = 'Đèn giải trí';
            modeDescription = 'Ánh sáng màu sắc, tạo không khí vui vẻ.';
            sendCommand('Giải trí');
            break;
        default:
            modeText = 'Đèn ăn cơm';
            modeDescription = 'Ánh sáng ấm áp, tạo không khí gia đình.';
            sendCommand('Ăn cơm');
    }
    document.getElementById('current-mode').textContent = modeText;
    document.getElementById('mode-description').textContent = modeDescription;
    addHistory('Thay đổi chế độ', modeText);
}


// History: Thêm lịch sử
let historyData = [];
function addHistory(action, mode) {
    const time = new Date().toLocaleString();
    historyData.push({ time, action, mode });
    if (document.getElementById('history-body')) {
        renderHistory();
    }
}

// History: Hiển thị lịch sử
function renderHistory() {
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';
    historyData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.action}</td>
            <td>${item.mode}</td>
        `;
        tbody.appendChild(row);
    });
}

// History: Tìm kiếm
function searchHistory() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filteredData = historyData.filter(item => 
        item.action.toLowerCase().includes(keyword) || 
        item.mode.toLowerCase().includes(keyword) || 
        item.time.toLowerCase().includes(keyword)
    );
    historyData = filteredData;
    renderHistory();
}

// History: Sắp xếp
function sortHistory() {
    const sortBy = document.getElementById('sort-select').value;
    historyData.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
    renderHistory();
}

// Account: Đăng nhập/đăng xuất
function login() {
    alert('Đăng nhập thành công (giả lập)!');
}

function logout() {
    alert('Đăng xuất thành công (giả lập)!');
    window.location.href = 'index.html';
}

// Khởi tạo dữ liệu giả lập
window.onload = function() {
    if (document.getElementById('history-body')) {
        renderHistory();
    }
};
// Chuyển đổi giữa tab Đăng nhập và Đăng ký
function openTab(event, tabName) {
    const tabcontents = document.getElementsByClassName('tabcontent');
    for (let i = 0; i < tabcontents.length; i++) {
        tabcontents[i].style.display = 'none';
    }

    const tablinks = document.getElementsByClassName('tablinks');
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(' active', '');
    }

    document.getElementById(tabName).style.display = 'block';
    event.currentTarget.className += ' active';
}

// Xử lý đăng nhập
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    // Lấy dữ liệu từ localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        alert('Đăng nhập thành công!');
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html'; // Chuyển hướng đến Dashboard
    } else {
        error.textContent = 'Email hoặc mật khẩu không đúng!';
    }
}

// Xử lý đăng ký
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const error = document.getElementById('register-error');

    // Kiểm tra mật khẩu xác nhận
    if (password !== confirmPassword) {
        error.textContent = 'Mật khẩu xác nhận không khớp!';
        return;
    }

    // Lấy danh sách người dùng từ localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Kiểm tra email đã tồn tại
    if (users.some(user => user.email === email)) {
        error.textContent = 'Email đã được sử dụng!';
        return;
    }

    // Thêm người dùng mới
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    openTab({ currentTarget: document.getElementsByClassName('tablinks')[0] }, 'login');
}

// Cập nhật thông tin người dùng trong trang Account
function updateUserInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-email').textContent = currentUser.email;
    }
}

// Gọi hàm cập nhật thông tin người dùng khi trang Account được tải
if (document.getElementById('user-name')) {
    updateUserInfo();
}

// Cập nhật hàm logout
function logout() {
    localStorage.removeItem('currentUser');
    alert('Đăng xuất thành công!');
    window.location.href = 'login.html';
}