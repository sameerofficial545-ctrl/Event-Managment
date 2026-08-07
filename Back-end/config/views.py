from django.http import JsonResponse

# These back the handler400/403/404/500 hooks in config/urls.py. They only
# fire for requests that never reach a DRF view - most commonly an
# unmatched URL - since DRF's own exception handler (config/exceptions.py)
# already turns everything inside a view into JSON.


def bad_request(request, exception=None):
    return JsonResponse(
        {
            'error': {
                'status': 400,
                'code': 'bad_request',
                'message': 'The request could not be understood.',
                'details': None,
            }
        },
        status=400,
    )


def permission_denied(request, exception=None):
    return JsonResponse(
        {
            'error': {
                'status': 403,
                'code': 'permission_denied',
                'message': 'You do not have permission to perform this action.',
                'details': None,
            }
        },
        status=403,
    )


def not_found(request, exception=None):
    return JsonResponse(
        {
            'error': {
                'status': 404,
                'code': 'not_found',
                'message': 'The requested resource was not found.',
                'details': None,
            }
        },
        status=404,
    )


def server_error(request):
    return JsonResponse(
        {
            'error': {
                'status': 500,
                'code': 'internal_server_error',
                'message': 'An unexpected error occurred. Please try again later.',
                'details': None,
            }
        },
        status=500,
    )
