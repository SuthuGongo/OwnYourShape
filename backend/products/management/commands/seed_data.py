"""
Run with: python manage.py seed_data
Creates sample categories, products, variants so the shop has data immediately.
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, Product, ProductVariant


LINGERIE = [
    ("Sexy in Black", 700, 900),
    ("Butterfly Beauty", 550, None),
    ("Red Temptation", 750, None),
    ("Lioness", 500, None),
    ("Sunflower", 600, 750),
    ("Mother Earth", 800, None),
    ("Unstoppable Force", 900, None),
    ("Scarlet", 600, 750),
    ("Lady in Red", 850, None),
    ("Double Trouble", 700, None),
    ("Angel Sent", 550, None),
    ("Bella", 550, None),
    ("Pearl", 700, None),
    ("Mamacita", 500, None),
    ("Red Rose", 750, None),
    ("Emerald", 750, None),
]

SWIMWEAR = [
    ("Queen", 450, None),
    ("Paradise", 350, None),
    ("Blue Sky", 350, None),
    ("Force to be Reckoned With", 350, None),
    ("Salty but Sweet", 400, None),
    ("Golden Hour", 400, None),
    ("Irreplaceable", 400, None),
    ("Mermaid", 350, None),
    ("Classy Lady", 350, None),
    ("Brightness", 300, None),
    ("Moonlight", 350, None),
    ("Irresistible", 350, None),
    ("DIVA", 730, None),
    ("A Star", 300, None),
    ("Sunlight", 400, None),
    ("Hot Mammi", 350, None),
]

SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]


class Command(BaseCommand):
    help = "Seed the database with sample products"

    def handle(self, *args, **options):
        lingerie_cat, _ = Category.objects.get_or_create(
            slug="lingerie",
            defaults={"name": "Lingerie", "description": "Luxury lingerie collection"}
        )
        swimwear_cat, _ = Category.objects.get_or_create(
            slug="swimwear",
            defaults={"name": "Swimwear", "description": "Summer swimwear collection"}
        )

        created = 0
        for name, price, compare_at in LINGERIE:
            slug = slugify(name)
            if not Product.objects.filter(slug=slug).exists():
                p = Product.objects.create(
                    category=lingerie_cat,
                    name=name,
                    slug=slug,
                    price=price,
                    compare_at_price=compare_at,
                    is_featured=(compare_at is not None),
                    description=f"A stunning piece from our lingerie collection. {name} is designed to make you feel confident and beautiful.",
                    fabric_care="85% Polyamide, 15% Elastane. Hand wash in cold water. Do not bleach. Lay flat to dry.",
                    sizing_fit="Runs true to size. Size up if between sizes.",
                )
                for size in SIZES:
                    ProductVariant.objects.create(
                        product=p, size=size,
                        stock=0 if size in ["XXL", "XXXL"] else 10
                    )
                created += 1

        for name, price, compare_at in SWIMWEAR:
            slug = slugify(name)
            if not Product.objects.filter(slug=slug).exists():
                p = Product.objects.create(
                    category=swimwear_cat,
                    name=name,
                    slug=slug,
                    price=price,
                    compare_at_price=compare_at,
                    is_featured=False,
                    description=f"From our swimwear collection. {name} is crafted to flatter every body type.",
                    fabric_care="80% Nylon, 20% Elastane. Rinse in cold water after each use. Do not bleach.",
                    sizing_fit="Runs true to size. We recommend sizing up for a more comfortable fit.",
                )
                for size in SIZES:
                    ProductVariant.objects.create(
                        product=p, size=size,
                        stock=0 if size in ["XXL", "XXXL"] else 8
                    )
                created += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created} products."))
