from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import success_response

from apps.product.api.serializers.category.public.category_popular import (
    CategoryPopularSerializer,
)
from apps.product.api.serializers.category.public.category_mega_menu import (
    CategoryMegaMenuSerializer
)
from apps.product.models.category import Category


class CategoryPopularView(APIView):

    def get(self, request):
        queryset = Category.objects.popular()

        serializer = CategoryPopularSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )


class CategoryMegaMenuView(APIView):

    def get(self, request):
        queryset = Category.objects.mega_menu()

        serializer = CategoryMegaMenuSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )
