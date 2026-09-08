from rest_framework import serializers
from apps.product.models.category import Category


class CategoryMegaMenuSerializer(serializers.ModelSerializer):
    """
    سریالایزر برای منوی مگا منو با ساختار سلسله‌مراتبی
    """

    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            "title",
            "image",
            "slug",
            "children",
        )

    def get_children(self, obj):
        children = obj.children.all()
        return CategoryMegaMenuSerializer(
            children,
            many=True,
            context=self.context,
        ).data