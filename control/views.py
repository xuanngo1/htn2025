from django.shortcuts import render
from django.http import JsonResponse
import paho.mqtt.client as mqtt
from django.views.decorators.csrf import csrf_exempt
import json

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

def index(request):
    return render(request, 'index.html')

def history(request):
    return render(request, 'history.html')

def account(request):
    return render(request, 'account.html')

def get_light_data(request):
    return JsonResponse({"light": light_value})

@csrf_exempt
def control_led(request):
    if request.method == "POST":
        data = json.loads(request.body)
        command = data.get("command")

        if command:
            client.publish(TOPIC_LED, command)
            return JsonResponse({"status": "success", "message": f"Sent command: {command}"})
        else:
            return JsonResponse({"status": "error", "message": "Invalid command"})
    
    return JsonResponse({"status": "error", "message": "Only POST method allowed"})