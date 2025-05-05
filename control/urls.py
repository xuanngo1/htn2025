from django.urls import path
from .views import get_light_data, control_led, index, history, account, login_view, register_view,logout_view

urlpatterns = [
    path('index/', index, name='index'),
    path('api/light/', get_light_data, name='light_data'),  # Lấy dữ liệu ánh sáng
    path('api/led/', control_led, name='control_led'),  # Điều khiển LED
    path('history/', history, name='history'),
    path('account/', account, name='account'),
    path('', login_view, name='login'),
    path('register/', register_view, name='register'),
    path('logout/', logout_view, name='logout'),
]
