from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant, Review


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'is_main', 'order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        if obj.image:
            return obj.image.url
        return None


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'colour', 'stock', 'in_stock']


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name[0]}."


class ProductListSerializer(serializers.ModelSerializer):
    main_image_url = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    # NOTE: no subcategory — model only has category
    # Filter tabs work by matching category.slug or tags on the frontend
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    discount_percent = serializers.IntegerField(read_only=True)
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug',
            'category',
            'price', 'compare_at_price', 'discount_percent',
            'main_image_url', 'images',
            'variants',
            'is_featured', 'is_wishlisted',
        ]

    def get_main_image_url(self, obj):
        request = self.context.get('request')
        img = obj.main_image
        if img and img.image:
            if request:
                return request.build_absolute_uri(img.image.url)
            return img.image.url
        return None

    def get_images(self, obj):
        request = self.context.get('request')
        result = []
        for img in obj.images.all():
            url = None
            if img.image:
                url = request.build_absolute_uri(img.image.url) if request else img.image.url
            result.append({
                'id': img.id,
                'image_url': url,
                'alt_text': img.alt_text,
                'is_main': img.is_main,
                'order': img.order,
            })
        return result

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.wishlisted_by.filter(id=request.user.id).exists()
        return False


class ProductSerializer(serializers.ModelSerializer):
    # Fixed: removed context={'request': None} that was breaking image URLs
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    avg_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug',
            'category',
            'description', 'fabric_care', 'sizing_fit',
            'price', 'compare_at_price', 'discount_percent',
            'images', 'variants', 'reviews',
            'avg_rating', 'review_count',
            'is_featured', 'is_wishlisted', 'created_at',
        ]

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.wishlisted_by.filter(id=request.user.id).exists()
        return False