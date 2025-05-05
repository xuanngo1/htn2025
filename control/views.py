from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
import paho.mqtt.client as mqtt
from django.views.decorators.csrf import csrf_exempt
import json
from .models import LightLog
from django.utils import timezone
from datetime import timedelta
from django.core.serializers.json import DjangoJSONEncoder
from django.utils.dateformat import DateFormat
from django.utils.formats import get_format

# Cấu hình MQTT
MQTT_BROKER = "f91ef2f36eb14043984d3faf256e952d.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "htn2025"
MQTT_PASS = "htn2025A"
TOPIC_LIGHT = "esp32/sensor"
TOPIC_LED = "esp32/control/led"

# Biến lưu giá trị ánh sáng
light_value = 0  

# Xử lý khi kết nối MQTT
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Kết nối MQTT thành công!")
        client.subscribe(TOPIC_LIGHT)
    else:
        print(f"Kết nối lỗi: {rc}")

# Xử lý khi nhận dữ liệu từ cảm biến
def on_message(client, userdata, msg):
    global light_value
    if msg.topic == TOPIC_LIGHT:
        light_value = int(msg.payload.decode())
        print(f"Ánh sáng: {light_value}")

# Khởi tạo MQTT client
client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASS)
client.tls_set()
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()


def logout_view(request):
    logout(request)
    return redirect('login')

# Đăng ký người dùng
def register_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')

        # Kiểm tra mật khẩu xác nhận
        if password != confirm_password:
            messages.error(request, "Mật khẩu xác nhận không khớp!")
            return render(request, 'login.html', {'active_tab': 'register'})

        # Kiểm tra email đã tồn tại trong cơ sở dữ liệu
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email này đã được đăng ký.")
            return render(request, 'login.html', {'active_tab': 'register'})

        # Tạo người dùng mới
        user = User.objects.create_user(username=email, email=email, password=password)
        user.first_name = name  # Lưu tên vào trường first_name (hoặc có thể thêm trường full_name nếu muốn)
        user.save()

        # Thông báo thành công
        messages.success(request, "Đăng ký thành công! Bạn có thể đăng nhập ngay.")
        return redirect('login')

    return render(request, 'login.html', {'active_tab': 'register'})


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('index')
        else:
            messages.error(request, "Thông tin đăng nhập không đúng!")
            return render(request, 'login.html', {'active_tab': 'login'})

    return render(request, 'login.html', {'active_tab': 'login'})

@login_required(login_url='login')
def account(request):
    user = request.user  # Lấy user đang đăng nhập
    context = {
        'user_name': user.first_name,
        'user_email': user.email,
    }
    return render(request, 'account.html', context)

@login_required(login_url='login')
def index(request):
    return render(request, 'index.html')

@login_required(login_url='login')
def history(request):
    logs = LightLog.objects.order_by('-timestamp')  # Mới nhất trước
    log_list = [
        {
            'time': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
            'mode': log.status,
            'action': log.source
        } for log in logs
    ]

    return render(request, 'history.html', {
        'logs': logs,
        'log_list': log_list  # thêm dòng này
    })



@login_required(login_url='login')
def get_light_data(request):
    return JsonResponse({"light": light_value})

@csrf_exempt
def control_led(request):
    if request.method == "POST":
        data = json.loads(request.body)
        command = data.get("command")
        source = data.get("source", "Click")

        if command:
            # Lấy trạng thái của đèn trước đó từ database
            last_log = LightLog.objects.last()  # Lấy bản ghi log cuối cùng

            # Kiểm tra nếu status khác với status trước đó
            if last_log and last_log.status != command:
                # Lấy thời gian hiện tại và cộng thêm 7 giờ (giờ Việt Nam)
                current_time = timezone.now() + timedelta(hours=7)
                
                # Lưu log vào database
                LightLog.objects.create(
                    status=command,
                    source=source,
                    timestamp=current_time
                )
            
            # Gửi command qua MQTT
            client.publish(TOPIC_LED, command)

            return JsonResponse({"status": "success", "message": f"Sent command: {command}"})
        else:
            return JsonResponse({"status": "error", "message": "Invalid command"})
    
    return JsonResponse({"status": "error", "message": "Only POST method allowed"})


