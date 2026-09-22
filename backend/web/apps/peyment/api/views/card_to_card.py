from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.order.models import Order
from apps.order.models.services.order import OrderService
from apps.peyment.models import Peyment, Receipt
from apps.peyment.models.service.card_to_card import CardToCardService
from apps.peyment.api.serializers import (
    PeymentSerializer,
    PeymentCreateSerializer,
    ReceiptSerializer,
    ReceiptCreateSerializer,
    ReviewCreateSerializer,
    IgnoreOrAcceptSerializer,
)
from apps.core.api.response import success_response, error_response


class CardToCardCreateView(APIView):
    """ایجاد پرداخت کارت به کارت"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PeymentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                error_response(
                    code='validation_error',
                    message='داده‌های ورودی نامعتبر است',
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        order = Order.objects.filter(id=data['order_id']).first()

        if not order:
            return Response(
                error_response(
                    code='order_not_found',
                    message='سفارش یافت نشد',
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.user_id != request.user.id:
            return Response(
                error_response(
                    code='forbidden',
                    message='دسترسی ندارید',
                ),
                status=status.HTTP_403_FORBIDDEN,
            )

        # بررسی کامل قابل پرداخت بودن و نبود پرداخت در انتظار
        is_valid, error_code = OrderService.can_create_payment(order)
        if not is_valid:
            return Response(
                error_response(
                    code=error_code.lower(),
                    message='امکان ایجاد پرداخت برای این سفارش وجود ندارد',
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        # مبلغ از خود سفارش
        amount = OrderService.get_payable_amount(order)

        peyment = CardToCardService.create_peyment(
            order=order,
            customer=request.user,
            amount=amount,
            description=data.get('description'),
        )

        return Response(
            success_response(PeymentSerializer(peyment).data),
            status=status.HTTP_201_CREATED,
        )


class CardToCardAttachReceiptView(APIView):
    """آپلود رسید برای یک پرداخت کارت به کارت"""
    permission_classes = [IsAuthenticated]

    def post(self, request, peyment_id):
        peyment = Peyment.objects.filter(
            id=peyment_id,
            customer=request.user,
            peyment_type=Peyment.PeymentType.CARD_TO_CARD,
        ).first()

        if not peyment:
            return Response(
                error_response(
                    code='peyment_not_found',
                    message='پرداخت یافت نشد',
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ReceiptCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                error_response(
                    code='validation_error',
                    message='داده‌های ورودی نامعتبر است',
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        receipt = CardToCardService.attach_receipt(
            peyment=peyment,
            image=data['image'],
            code_peygiri=data.get('codePeygiri'),
        )

        return Response(
            success_response(ReceiptSerializer(receipt).data),
            status=status.HTTP_201_CREATED,
        )


class CardToCardReviewView(APIView):
    """تأیید یا رد رسید توسط ادمین"""
    permission_classes = [IsAuthenticated]

    def post(self, request, receipt_id):
        receipt = Receipt.objects.filter(id=receipt_id).first()

        if not receipt:
            return Response(
                error_response(
                    code='receipt_not_found',
                    message='رسید یافت نشد',
                ),
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ReviewCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                error_response(
                    code='validation_error',
                    message='داده‌های ورودی نامعتبر است',
                    fields=serializer.errors,
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        review = CardToCardService.review_receipt(
            receipt=receipt,
            reviewer=request.user,
            is_accept=data['is_accept'],
            reason=data.get('reason'),
        )

        return Response(
            success_response(IgnoreOrAcceptSerializer(review).data),
            status=status.HTTP_201_CREATED,
        )


class CardToCardListView(APIView):
    """لیست پرداخت‌های کارت به کارت کاربر"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = CardToCardService.list_peyments(customer=request.user)

        return Response(
            success_response(PeymentSerializer(qs, many=True).data),
            status=status.HTTP_200_OK,
        )