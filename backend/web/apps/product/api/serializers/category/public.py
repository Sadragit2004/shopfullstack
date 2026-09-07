from rest_framework import serializers

from apps.product.models.category import Category
from apps.product.models.product import Product


class CategoryPopularSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
        )


class CategoryMegaMenuChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
        )


class CategoryMegaMenuSerializer(serializers.ModelSerializer):
    children = CategoryMegaMenuChildSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
            "children",
        )


class CategoryProductSerializer(serializers.ModelSerializer):
    brand = serializers.StringRelatedField(
        read_only=True,
    )

    class Meta:
        model = Product
        fields = (
            "title",
            "cover_image",
            "slug",
            "created_at",
            "brand",
        )


class CategoryProductsSerializer(serializers.ModelSerializer):
    products = CategoryProductSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
            "products",
        )