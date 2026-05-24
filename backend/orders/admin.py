from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['line_total']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'email', 'status', 'total', 'created_at']
    list_filter = ['status']
    search_fields = ['order_number', 'email']
    readonly_fields = ['order_number', 'created_at']
    inlines = [OrderItemInline]
