from django.urls import path

from . import views

urlpatterns = [
    # Auth flows
    path('request-otp/', views.request_otp, name='request-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('refresh/', views.token_refresh, name='token-refresh'),
    path('logout/', views.logout, name='logout'),

    # User profile
    path('me/', views.user_me, name='user-me'),
]
