
from django.db import models


class LogisticsManager(models.Manager):

    def active(self):
        return (
            self.filter(
                is_active=True,
            )
            .order_by("-created_at")
        )

    def prepaid(self):
        return self.filter(
            type="prepaid",
            is_active=True,
        )

    def postpaid(self):
        return self.filter(
            type="postpaid",
            is_active=True,
        )

    def create_logistics(
        self,
        *,
        type,
        title,
        price=0,
        is_active=True,
    ):
        from ..services.logistics import LogisticsService

        return LogisticsService.create(
            type=type,
            title=title,
            price=price,
            is_active=is_active,
        )

