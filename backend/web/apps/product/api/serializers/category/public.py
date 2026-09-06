from rest_framework import serializers

from apps.product.models.category import Category


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
    class Meta:
        model = Category.products.rel.related_model
        fields = "__all__"


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