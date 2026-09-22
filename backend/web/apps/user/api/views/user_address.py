from django.core.exceptions import ValidationError

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.api.response import success_response, error_response

from ..serializers.user_address import (
    UserAddressSerializer,
    UserAddressCreateSerializer,
    UserAddressUpdateSerializer,
    ProvinceListSerializer,
    CityListSerializer,
)

from ...models.service.user_address import UserAddressService


# ============================================================
# Province List
# GET /api/v1/provinces/
# ============================================================

class ProvinceListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        provinces = UserAddressService.get_provinces()

        serializer = ProvinceListSerializer(
            provinces,
            many=True,
        )

        return Response(
            success_response(serializer.data),
            status=200,
        )


# ============================================================
# City List
# GET /api/v1/provinces/<province_id>/cities/
# ============================================================

class CityListByProvinceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, province_id):
        cities = UserAddressService.get_cities_by_province(
            province_id
        )

        serializer = CityListSerializer(
            cities,
            many=True,
        )

        return Response(
            success_response(serializer.data),
            status=200,
        )


# ============================================================
# User Address List / Create
#
# GET  /api/v1/addresses/
# POST /api/v1/addresses/
# ============================================================

class UserAddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        addresses = UserAddressService.get_user_addresses(
            request.user
        )

        serializer = UserAddressSerializer(
            addresses,
            many=True,
        )

        return Response(
            success_response(serializer.data),
            status=200,
        )

    def post(self, request):
        serializer = UserAddressCreateSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                error_response(
                    code="VALIDATION_ERROR",
                    message="اطلاعات وارد شده صحیح نیست.",
                    fields=serializer.errors,
                ),
                status=400,
            )

        try:
            user_address = UserAddressService.create_address(
                request.user,
                **serializer.validated_data,
            )

        except ValidationError as exc:
            return Response(
                error_response(
                    code="INVALID_ADDRESS",
                    message=str(exc),
                ),
                status=400,
            )

        response_serializer = UserAddressSerializer(
            user_address
        )

        return Response(
            success_response(response_serializer.data),
            status=201,
        )


# ============================================================
# User Address Detail
#
# PATCH  /api/v1/addresses/<address_id>/
# DELETE /api/v1/addresses/<address_id>/
# ============================================================

class UserAddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, address_id):
        serializer = UserAddressUpdateSerializer(
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
                status=400,
            )

        try:
            user_address = UserAddressService.update_address(
                request.user,
                address_id,
                **serializer.validated_data,
            )

        except ValidationError as exc:
            return Response(
                error_response(
                    code="INVALID_ADDRESS",
                    message=str(exc),
                ),
                status=400,
            )

        if user_address is None:
            return Response(
                error_response(
                    code="ADDRESS_NOT_FOUND",
                    message="آدرس مورد نظر پیدا نشد.",
                ),
                status=404,
            )

        response_serializer = UserAddressSerializer(
            user_address
        )

        return Response(
            success_response(response_serializer.data),
            status=200,
        )

    def delete(self, request, address_id):
        deleted = UserAddressService.delete_address(
            request.user,
            address_id,
        )

        if not deleted:
            return Response(
                error_response(
                    code="ADDRESS_NOT_FOUND",
                    message="آدرس مورد نظر پیدا نشد.",
                ),
                status=404,
            )

        return Response(
            success_response(),
            status=204,
        )


# ============================================================
# Admin - All User Addresses
#
# GET /api/v1/admin/addresses/
# ============================================================

class AdminUserAddressListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response(
                error_response(
                    code="PERMISSION_DENIED",
                    message="شما دسترسی لازم برای مشاهده آدرس‌ها را ندارید.",
                ),
                status=403,
            )

        addresses = UserAddressService.get_all_addresses()

        serializer = UserAddressSerializer(
            addresses,
            many=True,
        )

        return Response(
            success_response(serializer.data),
            status=200,
        )