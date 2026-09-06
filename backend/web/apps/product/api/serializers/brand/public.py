from rest_framework import serializers

from apps.product.models.brand import Brand


class BrandPublicSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        source="name",
        read_only=True,
    )

    image = serializers.ImageField(
        source="logo",
        read_only=True,
    )

    class Meta:
        model = Brand
        fields = (
            "title",
            "image",
            "created_at",
            "slug",
        )