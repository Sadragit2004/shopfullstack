from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import success_response
from apps.product.models.brand import Brand
from apps.product.api.serializers.brand.public import BrandPublicSerializer


class BrandPublicView(APIView):

    def get(self, request):
        queryset = Brand.objects.active_by_product_count()

        serializer = BrandPublicSerializer(
            queryset,
            many=True,
            context={"request": request},
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )