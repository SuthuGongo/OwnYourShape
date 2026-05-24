from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderCreateView.as_view()),
    path('my-orders/', views.MyOrdersView.as_view()),
    path('validate-promo/', views.ValidatePromoView.as_view()),
    path('<str:order_number>/', views.OrderDetailView.as_view()),
]
