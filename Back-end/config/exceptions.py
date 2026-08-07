import logging

from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger('django.request')

# Fallback codes for exceptions that don't expose get_codes() (e.g. Http404,
# Django's PermissionDenied) after DRF has already converted them.
DEFAULT_CODES = {
    400: 'bad_request',
    401: 'not_authenticated',
    403: 'permission_denied',
    404: 'not_found',
    405: 'method_not_allowed',
    406: 'not_acceptable',
    415: 'unsupported_media_type',
    429: 'throttled',
    500: 'internal_server_error',
}


def _code_for(exc, status_code):
    get_codes = getattr(exc, 'get_codes', None)
    if callable(get_codes):
        codes = get_codes()
        if isinstance(codes, str):
            return codes
    return DEFAULT_CODES.get(status_code, 'error')


def _message_for(detail):
    if isinstance(detail, dict) and set(detail.keys()) == {'detail'}:
        return str(detail['detail'])
    if isinstance(detail, dict):
        return 'One or more fields failed validation.'
    if isinstance(detail, list) and detail:
        return str(detail[0])
    return str(detail)


def custom_exception_handler(exc, context):
    """
    Wraps every DRF error response - and anything DRF doesn't recognise -
    into one consistent envelope: {"error": {status, code, message, details}}.

    Without this, an exception that isn't a recognised APIException (a real
    bug, a driver error, etc.) would propagate past DRF and hit Django's
    generic HTML error page instead of returning JSON.
    """
    response = drf_exception_handler(exc, context)

    if response is not None:
        detail = response.data
        response.data = {
            'error': {
                'status': response.status_code,
                'code': _code_for(exc, response.status_code),
                'message': _message_for(detail),
                'details': detail,
            }
        }
        return response

    request = context.get('request')
    logger.error(
        'Unhandled exception on %s %s',
        getattr(request, 'method', '?'),
        getattr(request, 'path', '?'),
        exc_info=exc,
    )

    details = None
    if settings.DEBUG:
        details = {'exception': exc.__class__.__name__, 'message': str(exc)}

    return Response(
        {
            'error': {
                'status': 500,
                'code': 'internal_server_error',
                'message': 'An unexpected error occurred. Please try again later.',
                'details': details,
            }
        },
        status=500,
    )
