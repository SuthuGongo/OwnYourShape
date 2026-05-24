from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product, ProductVariant

PROMO_CODES = {
    'WELCOME': 10,
    'DREAMINLACE': 15,
    'SUMMER25': 25,
}

DELIVERY_THRESHOLD = 850
DELIVERY_FEE = 95


class OrderItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'size', 'colour', 'price', 'quantity', 'line_total']


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    variant_id = serializers.IntegerField(required=False, allow_null=True)
    size = serializers.CharField(max_length=10, required=False, allow_blank=True)
    colour = serializers.CharField(max_length=50, required=False, allow_blank=True)
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()
    shipping_name = serializers.CharField(max_length=100)
    shipping_street = serializers.CharField(max_length=255)
    shipping_city = serializers.CharField(max_length=100)
    shipping_province = serializers.CharField(max_length=100)
    shipping_postal_code = serializers.CharField(max_length=10)
    shipping_phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    promo_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Order must contain at least one item.")
        return items

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        promo_code = validated_data.get('promo_code', '').upper().strip()

        subtotal = 0
        order_items = []

        for item_data in items_data:
            try:
                product = Product.objects.get(id=item_data['product_id'], is_active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product {item_data['product_id']} not found.")

            variant = None
            if item_data.get('variant_id'):
                try:
                    variant = ProductVariant.objects.get(id=item_data['variant_id'], product=product)
                except ProductVariant.DoesNotExist:
                    pass

            price = float(product.price)
            quantity = item_data['quantity']
            subtotal += price * quantity

            order_items.append({
                'product': product,
                'variant': variant,
                'product_name': product.name,
                'size': item_data.get('size', variant.size if variant else ''),
                'colour': item_data.get('colour', variant.colour if variant else ''),
                'price': price,
                'quantity': quantity,
            })

        discount_pct = PROMO_CODES.get(promo_code, 0)
        discount = round(subtotal * discount_pct / 100, 2)
        discounted = subtotal - discount
        delivery_fee = 0 if discounted >= DELIVERY_THRESHOLD else DELIVERY_FEE
        total = discounted + delivery_fee

        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            email=validated_data['email'],
            shipping_name=validated_data['shipping_name'],
            shipping_street=validated_data['shipping_street'],
            shipping_city=validated_data['shipping_city'],
            shipping_province=validated_data['shipping_province'],
            shipping_postal_code=validated_data['shipping_postal_code'],
            shipping_phone=validated_data.get('shipping_phone', ''),
            promo_code=promo_code,
            notes=validated_data.get('notes', ''),
            subtotal=subtotal,
            discount=discount,
            delivery_fee=delivery_fee,
            total=total,
        )

        for item in order_items:
            OrderItem.objects.create(order=order, **item)

        return order


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'email', 'status', 'items',
            'shipping_name', 'shipping_street', 'shipping_city',
            'shipping_province', 'shipping_postal_code', 'shipping_phone',
            'subtotal', 'discount', 'delivery_fee', 'total',
            'promo_code', 'notes', 'created_at',
        ]
