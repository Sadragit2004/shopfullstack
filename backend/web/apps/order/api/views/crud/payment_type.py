from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


from apps.core.api.response import (
    success_response,
    error_response,
)

from ...serializers.payment_type import PaymentTypeSerializer
from ....models import PaymentType


class PaymentTypeListCreateView(APIView):

    def get(self, request):
        queryset = PaymentType.objects.all()

        serializer = PaymentTypeSerializer(
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
        serializer = PaymentTypeSerializer(
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

        payment_type = PaymentType.objects.create_payment_type(
            code=serializer.validated_data["code"],
            title=serializer.validated_data["title"],
            is_active=serializer.validated_data.get(
                "is_active",
                True,
            ),
        )

        return Response(
            success_response(
                data=PaymentTypeSerializer(
                    payment_type,
                ).data,
            ),
            status=status.HTTP_201_CREATED,
        )


class PaymentTypeDetailView(APIView):

    def get_object(self, pk):
        return PaymentType.objects.filter(
            pk=pk,
        ).first()

    def get(self, request, pk):
        payment_type = self.get_object(pk)

        if not payment_type:
            return Response(
                error_response(
                    code="PAYMENT_TYPE_NOT_FOUND",
                    message="نوع پرداخت پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            success_response(
                data=PaymentTypeSerializer(
                    payment_type,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        payment_type = self.get_object(pk)

        if not payment_type:
            return Response(
                error_response(
                    code="PAYMENT_TYPE_NOT_FOUND",
                    message="نوع پرداخت پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentTypeSerializer(
            payment_type,
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

        payment_type = serializer.save()

        return Response(
            success_response(
                data=PaymentTypeSerializer(
                    payment_type,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        payment_type = self.get_object(pk)

        if not payment_type:
            return Response(
                error_response(
                    code="PAYMENT_TYPE_NOT_FOUND",
                    message="نوع پرداخت پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentTypeSerializer(
            payment_type,
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

        payment_type = serializer.save()

        return Response(
            success_response(
                data=PaymentTypeSerializer(
                    payment_type,
                ).data,
            ),
            status=status.HTTP_200_OK,
        )

    def delete(self, request, pk):
        payment_type = self.get_object(pk)

        if not payment_type:
            return Response(
                error_response(
                    code="PAYMENT_TYPE_NOT_FOUND",
                    message="نوع پرداخت پیدا نشد.",
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        payment_type.delete()

        return Response(
            success_response(),
            status=status.HTTP_200_OK,
        )