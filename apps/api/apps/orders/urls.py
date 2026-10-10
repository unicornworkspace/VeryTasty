from django.urls import path

from . import views

urlpatterns = [
    path('', views.list_orders, name='order-list'),
    path('create/', views.create_order, name='order-create'),
    path('<int:pk>/', views.get_order, name='order-detail'),
    path('<int:pk>/status/', views.update_order_status, name='order-status'),
]
