
// Sensor light
function fetchLightData() {
    fetch('/api/light/')
        .then(response => response.json())
        .then(data => {
            const light = data.light;
            document.getElementById("light-value").innerText = `${light} Lux`;

            // Tính phần trăm và giới hạn trong khoảng 0–100
            const percent = Math.min((light / 3500) * 100, 100);
            document.querySelector(".progress").style.width = `${percent}%`;
        })
        .catch(error => {
            console.error("Lỗi khi lấy dữ liệu ánh sáng:", error);
        });
}
setInterval(fetchLightData, 2000);

// Dashboard: Điều khiển bằng giọng nói (giả lập)
// Dashboard: Điều khiển bằng giọng nói


function sendCommand(command, source = "Click") {
    fetch('/api/led/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            command: command,
            source: source
        })
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

        if (voiceText.includes("đi ngủ")) {
            selectRadio('sleep');
        }
        else if (voiceText.includes("làm việc")) {
            selectRadio('work');
        }
        else if (voiceText.includes("ăn cơm")) {
            selectRadio('dinner');
        }
        else if (voiceText.includes("giải trí")) {
            selectRadio('entertainment');
        }
        else if (voiceText.includes("xem phim")) {
            selectRadio('movie');
        }
        else if (voiceText.includes("bật")) {
            turnOnLight("Voice");
        }
        else if (voiceText.includes("tắt")) {
            turnOffLight("Voice");
        }

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
function selectRadio(mode) {
    const radio = document.querySelector(`input[name="mode"][value="${mode}"]`);
    if (radio) {
        radio.checked = true;  // Chọn radio này
        changeMode(radio, "Voice");  // Gọi hàm changeMode
    }
}
// Dashboard: Điều khiển đèn
let isLightOn = false;
function turnOnLight(source = "Click") {
    if (!isLightOn) {
        isLightOn = true;
        const button = document.getElementById('toggle-light');
        button.textContent = 'Tắt đèn';
        button.classList.add('light-on');  // 👉 thêm màu đỏ
        sendCommand('Bật', source);
        document.getElementById('current-mode').textContent = "Bật đèn";
        document.getElementById('mode-description').textContent = "Đèn trong nhà đã được bật";
        localStorage.setItem('lightStatus', 'on'); 
    }
}

function turnOffLight(source = "Click") {
    if (isLightOn) {
        isLightOn = false;
        const button = document.getElementById('toggle-light');
        button.textContent = 'Bật đèn';
        button.classList.remove('light-on');  // 👉 bỏ màu đỏ
        sendCommand('Tắt', source);
        document.getElementById('current-mode').textContent = "Tắt đèn";
        document.getElementById('mode-description').textContent = "Đèn trong nhà đã tắt";

        localStorage.removeItem('lightMode');
        
        const radios = document.querySelectorAll('input[name="mode"]');
        radios.forEach(radio => radio.checked = false);

        localStorage.setItem('lightStatus', 'off'); // ← lưu trạng thái tắt
    }
}

function toggleLight(source = "Click") {
    if (isLightOn) {
        turnOffLight(source);
    } else {
        turnOnLight(source);
    }
}

// Dashboard: Chọn chế độ
function changeMode(radio, source) {
    const mode = radio.value;
    localStorage.setItem('lightMode', mode); // ← lưu chế độ
    let modeText = '';
    let modeDescription = '';
    switch (mode) {
        case 'dinner':
            modeText = 'Đèn ăn cơm';
            modeDescription = 'Ánh sáng ấm áp, tạo không khí gia đình.';
            sendCommand('Ăn cơm',source);
            break;
        case 'work':
            modeText = 'Đèn làm việc';
            modeDescription = 'Ánh sáng trắng, tập trung cao độ.';
            sendCommand('Làm việc',source);
            break;
        case 'movie':
            modeText = 'Đèn xem phim';
            modeDescription = 'Ánh sáng mờ, tăng trải nghiệm xem phim.';
            sendCommand('Xem phim',source);
            break;
        case 'sleep':
            modeText = 'Đèn đi ngủ';
            modeDescription = 'Ánh sáng dịu nhẹ, giúp thư giãn.';
            sendCommand('Đi ngủ',source);
            break;
        case 'entertainment':
            modeText = 'Đèn giải trí';
            modeDescription = 'Ánh sáng màu sắc, tạo không khí vui vẻ.';
            sendCommand('Giải trí',source);
            break;
        default:
            modeText = 'Đèn ăn cơm';
            modeDescription = 'Ánh sáng ấm áp, tạo không khí gia đình.';
            sendCommand('Ăn cơm',source);
    }
    document.getElementById('current-mode').textContent = modeText;
    document.getElementById('mode-description').textContent = modeDescription;
}

function updateModeDisplay(mode) {
    let modeText = '';
    let modeDescription = '';
    switch (mode) {
        case 'dinner':
            modeText = 'Đèn ăn cơm';
            modeDescription = 'Ánh sáng ấm áp, tạo không khí gia đình.';
            break;
        case 'work':
            modeText = 'Đèn làm việc';
            modeDescription = 'Ánh sáng trắng, tập trung cao độ.';
            break;
        case 'movie':
            modeText = 'Đèn xem phim';
            modeDescription = 'Ánh sáng mờ, tăng trải nghiệm xem phim.';
            break;
        case 'sleep':
            modeText = 'Đèn đi ngủ';
            modeDescription = 'Ánh sáng dịu nhẹ, giúp thư giãn.';
            break;
        case 'entertainment':
            modeText = 'Đèn giải trí';
            modeDescription = 'Ánh sáng màu sắc, tạo không khí vui vẻ.';
            break;
        default:
            modeText = 'Đèn ăn cơm';
            modeDescription = 'Ánh sáng ấm áp, tạo không khí gia đình.';
    }

    document.getElementById('current-mode').textContent = modeText;
    document.getElementById('mode-description').textContent = modeDescription;
}

function updateLightButtonUI(status) {
    const button = document.getElementById('toggle-light');
    if (status === 'on') {
        button.textContent = 'Tắt đèn';
        button.classList.add('light-on');
        document.getElementById('current-mode').textContent = "Bật đèn";
        document.getElementById('mode-description').textContent = "Đèn trong nhà đã được bật";
    } else {
        button.textContent = 'Bật đèn';
        button.classList.remove('light-on');
        document.getElementById('current-mode').textContent = "Tắt đèn";
        document.getElementById('mode-description').textContent = "Đèn trong nhà đã tắt";
    }
}


// History: Tìm kiếm
function searchHistory() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    historyData = originalData.filter(item => 
        item.action.toLowerCase().includes(keyword) || 
        item.mode.toLowerCase().includes(keyword) || 
        item.time.toLowerCase().includes(keyword)
    );
    currentPage = 1; // Reset về trang đầu sau khi tìm kiếm
    renderHistory();
}

    
// Phân trang
let currentPage = 1;
const recordsPerPage = 10;

function renderHistory() {
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';

    // Tính toán chỉ số bắt đầu và kết thúc của bản ghi trên trang hiện tại
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedData = historyData.slice(startIndex, endIndex);

    // Hiển thị các bản ghi trên trang hiện tại
    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.time}</td>
            <td>${item.action}</td>
            <td>${item.mode}</td>
        `;
        tbody.appendChild(row);
    });

    // Cập nhật thông tin phân trang
    const totalPages = Math.ceil(historyData.length / recordsPerPage);
    document.getElementById('page-info').textContent = `Trang ${currentPage} / ${totalPages}`;

    // Vô hiệu hóa nút "Trước" nếu đang ở trang đầu
    document.getElementById('prev-btn').disabled = currentPage === 1;
    // Vô hiệu hóa nút "Tiếp" nếu đang ở trang cuối
    document.getElementById('next-btn').disabled = currentPage === totalPages;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderHistory();
    }
}

function nextPage() {
    const totalPages = Math.ceil(historyData.length / recordsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderHistory();
    }
}

// History: Sắp xếp
function sortHistory() {
    const sortBy = document.getElementById('sort-select').value;
    historyData.sort((a, b) => {
        const timeA = new Date(a.time);
        const timeB = new Date(b.time);
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
    });
    currentPage = 1; // Reset về trang đầu sau khi sắp xếp
    renderHistory();
}

// Khi trang được load
document.addEventListener('DOMContentLoaded', () => {

    try {
        renderHistory();
        console.log("Đã gọi renderHistory");
    } catch (err) {
        console.error("Lỗi khi renderHistory:", err);
    }
    try {
        const lightStatus = localStorage.getItem('lightStatus');
        if (lightStatus === 'on') {
            isLightOn = true;
            updateLightButtonUI('on');
        } else if (lightStatus === 'off') {
            isLightOn = false;
            updateLightButtonUI('off');
        }

        const savedMode = localStorage.getItem('lightMode');
        if (savedMode) {
            const radio = document.querySelector(`input[name="mode"][value="${savedMode}"]`);
            if (radio) {
                radio.checked = true;
                updateModeDisplay(savedMode);
            }
        }

        console.log("Đã khôi phục lightStatus và lightMode");
    } catch (err) {
        console.error("Lỗi khi khôi phục trạng thái:", err);
    }

    
});


// Account: Đăng nhập/đăng xuất
function login() {
    alert('Đăng nhập thành công (giả lập)!');
}

function logout() {
    alert('Đăng xuất thành công (giả lập)!');
    window.location.href = 'index.html';
}

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
    // Gửi request GET đến route Django logout
    window.location.href = "/logout/";
}

