from django.urls import path
from ..views.card_to_card import (
    CardToCardCreateView,
    CardToCardAttachReceiptView,
    CardToCardReviewView,
    CardToCardListView,
)
from ..views.gateway import GatewayCreateView

app_name = 'peyment'


urlpatterns = [
    # ---------- پرداخت: کارت به کارت ----------
    path('card-to-card/create/', CardToCardCreateView.as_view(), name='card_create'),
    path('card-to-card/<int:peyment_id>/receipt/', CardToCardAttachReceiptView.as_view(), name='card_receipt'),
    path('card-to-card/review/<int:receipt_id>/', CardToCardReviewView.as_view(), name='card_review'),
    path('card-to-card/list/', CardToCardListView.as_view(), name='card_list'),

    # ---------- پرداخت: درگاه ----------
    path('gateway/create/', GatewayCreateView.as_view(), name='gateway_create'),
]