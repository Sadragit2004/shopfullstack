from rest_framework import serializers

from apps.product.models.product import Product


class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product

        fields = (
            "id",
            "brand",
            "categories",
            "title",
            "cover_image",
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