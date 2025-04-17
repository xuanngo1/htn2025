from django.urls import path
from .views import get_light_data, control_led, index, history, account

urlpatterns = [
    path('', index, name='index'),
    path('api/light/', get_light_data, name='light_data'),  # Lấy dữ liệu ánh sáng
    path('api/led/', control_led, name='control_led'),  # Điều khiển LED
    
    path('history/', history, name='history'),
    path('account/', account, name='account'),
]
