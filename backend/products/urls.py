from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view()),
    path('', views.ProductListView.as_view()),
    path('featured/', views.FeaturedProductsView.as_view()),
    path('<slug:slug>/', views.ProductDetailView.as_view()),
    path('<slug:slug>/reviews/', views.ReviewCreateView.as_view()),
]
