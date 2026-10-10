import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings.local'
django.setup()

from django.test import RequestFactory
from apps.auth.views import request_otp
import json

# Create a test request
factory = RequestFactory()
request = factory.post('/api/auth/request-otp/', {
    'phone': '+79991234567',
    'device_info': 'test'
}, content_type='application/json')

print("Testing /api/auth/request-otp/...")
try:
    response = request_otp(request)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.content.decode()}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
