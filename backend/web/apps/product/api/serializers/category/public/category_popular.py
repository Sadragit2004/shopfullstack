from rest_framework import serializers
from apps.product.models.category import Category


class CategoryPopularSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای نمایش دسته‌بندی‌های محبوب
    """

    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
        )