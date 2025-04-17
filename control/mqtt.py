import paho.mqtt.client as mqtt
from django.conf import settings
import json

MQTT_BROKER = "f91ef2f36eb14043984d3faf256e952d.s1.eu.hivemq.cloud"
MQTT_PORT = 8883
MQTT_USER = "htn2025"
MQTT_PASS = "htn2025A"
TOPIC_LIGHT = "esp32/sensor"
TOPIC_LED = "esp32/control/led"

light_value = 0  # Lưu giá trị ánh sáng

def on_connect(client, userdata, flags, rc):
    print("Kết nối MQTT thành công!" if rc == 0 else f"Kết nối lỗi: {rc}")
    client.subscribe(TOPIC_LIGHT)

def on_message(client, userdata, msg):
    global light_value
    if msg.topic == TOPIC_LIGHT:
        light_value = int(msg.payload.decode())
        print(f"Ánh sáng: {light_value}")

client = mqtt.Client()
client.username_pw_set(MQTT_USER, MQTT_PASS)
client.tls_set()  # Bật TLS
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_BROKER, MQTT_PORT, 60)
client.loop_start()  # Chạy nền
