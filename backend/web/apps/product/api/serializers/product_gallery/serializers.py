from rest_framework import serializers

from apps.product.models.product_gallery import ProductGallery


class ProductGallerySerializer(serializers.ModelSerializer):

    class Meta:
        model = ProductGallery

        fields = (
            "id",
            "product",
            "image",
            "sort_order",
            "is_active",
            "created_at",
        )

        read_only_fields = (
            "id",
            "created_at",
        )