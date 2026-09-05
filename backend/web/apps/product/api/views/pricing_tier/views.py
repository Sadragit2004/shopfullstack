from rest_framework import status
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.response import Response

from apps.product.models.pricing_tier import PricingTier
from apps.product.api.serializers.pricing_tier.serializers import (
    PricingTierSerializer,
)
from apps.core.api.response import success_response


class PricingTierListCreateView(ListCreateAPIView):

    queryset = PricingTier.objects.all()
    serializer_class = PricingTierSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(
            self.get_queryset(),
        )

        serializer = self.get_serializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        self.perform_create(serializer)

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_201_CREATED,
        )


class PricingTierDetailView(RetrieveUpdateDestroyAPIView):

    queryset = PricingTier.objects.all()
    serializer_class = PricingTierSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop(
            "partial",
            False,
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        self.perform_update(serializer)

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        self.perform_destroy(instance)

        return Response(
            success_response(),
            status=status.HTTP_204_NO_CONTENT,
        )