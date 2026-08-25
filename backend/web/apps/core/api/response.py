from typing import Any


def api_response(
    *,
    success: bool,
    data: Any = None,
    error: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Build a unified API response.

    Success:
        {
            "success": True,
            "data": {...}
        }

    Error:
        {
            "success": False,
            "error": {...}
        }
    """

    response: dict[str, Any] = {
        "success": success,
    }

    if success:
        response["data"] = data
    else:
        response["error"] = error

    return response


def success_response(
    data: Any = None,
) -> dict[str, Any]:
    """
    Build a successful API response.
    """

    return api_response(
        success=True,
        data=data,
    )


def error_response(
    *,
    code: str,
    message: str,
    fields: dict[str, dict[str, str]] | None = None,
    details: Any = None,
) -> dict[str, Any]:
    """
    Build a unified API error response.
    """

    error: dict[str, Any] = {
        "code": code,
        "message": message,
    }

    if fields:
        error["fields"] = fields

    if details is not None:
        error["details"] = details

    return api_response(
        success=False,
        error=error,
    )