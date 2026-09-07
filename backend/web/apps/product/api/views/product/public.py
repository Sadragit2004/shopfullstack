
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import success_response
from apps.product.models.product import Product
from apps.product.api.serializers.product.public import (
    ProductDetailSerializer,
)


class ProductDetailView(APIView):

    def get(self, request):

        slug = request.query_params.get("slug")

        if not slug:
            return Response(
                {
                    "success": False,
                    "message": "شناسه محصول الزامی است.",
                    "data": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = Product.objects.detail_by_slug(
            slug=slug,
        )

        if product is None:
            return Response(
                {
                    "success": False,
                    "message": "محصول مورد نظر یافت نشد.",
                    "data": None,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ProductDetailSerializer(
            product,
            context={
                "request": request,
            },
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )

