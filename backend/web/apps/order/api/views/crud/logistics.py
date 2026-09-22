from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


from apps.core.api.response import (
    success_response,
    error_response,
)

from ...serializers.logistics import LogisticsSerializer
from ....models import Logistics


class LogisticsListCreateView(APIView):

    def get(self, request):
        queryset = Logistics.objects.all()

        serializer = LogisticsSerializer(
            queryset,
            many=True,
        )

        return Response(
            success_response(
                data=serializer.data,
            ),
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = LogisticsSerializer(
            data=request.data,
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="اطلاعات وارد شده صحیح نیست.",
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        logistics = Logistics.objects.create_logistics(
            type=serializer.validated_data["type"],
            title=serializer.validated_data["title"],
            price=serializer.validated_data.get(
                "price",
                0,
            ),
            is_active=serializer.validated_data.get(
                "is_active",
                True,
            ),
        )

        return Response(
            success_response(
                data=LogisticsSerializer(
                    logistics,
                ).data,
            ),
            status=status.HTTP_201_CREATED,
        )


class LogisticsDetailView(APIView):

    def get_object(self, pk):
        return Logistics.objects.filter(
            pk=pk,
        ).first()

    def get(self, request, pk):
        logistics = self.get_object(pk)

        if not logistics:
            return Response(
                error_response(
                    code="LOGISTICS_NOT_FOUND",
                    message="روش ارسال پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            success_response(
                data=LogisticsSerializer(
                    logistics,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        logistics = self.get_object(pk)

        if not logistics:
            return Response(
                error_response(
                    code="LOGISTICS_NOT_FOUND",
                    message="روش ارسال پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LogisticsSerializer(
            logistics,
            data=request.data,
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="اطلاعات وارد شده صحیح نیست.",
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        logistics = serializer.save()

        return Response(
            success_response(
                data=LogisticsSerializer(
                    logistics,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        logistics = self.get_object(pk)

        if not logistics:
            return Response(
                error_response(
                    code="LOGISTICS_NOT_FOUND",
                    message="روش ارسال پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = LogisticsSerializer(
            logistics,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="اطلاعات وارد شده صحیح نیست.",
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        logistics = serializer.save()

        return Response(
            success_response(
                data=LogisticsSerializer(
                    logistics,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        logistics = self.get_object(pk)

        if not logistics:
            return Response(
                error_response(
                    code="LOGISTICS_NOT_FOUND",
                    message="روش ارسال پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        logistics.delete()

        return Response(
            success_response(),
            status=status.HTTP_200_OK,
        )