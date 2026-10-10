from django.urls import path

from . import views

urlpatterns = [
    path('me/', views.get_loyalty_me, name='loyalty-me'),
    path('history/', views.get_loyalty_history, name='loyalty-history'),
    path('qr-token/', views.get_loyalty_qr_token, name='loyalty-qr-token'),
    path('qr-verify/', views.verify_loyalty_qr_token, name='qr-verify'),
]
