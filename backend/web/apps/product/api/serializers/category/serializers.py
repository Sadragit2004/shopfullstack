from rest_framework import serializers

from apps.product.models.category import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "title",
            "parent",
            "image",
            "slug",
            "status",
            "description",
            "pdf",
            "video_file",
            "video_url",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
        )