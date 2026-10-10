import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings.local'
django.setup()

from django.test import RequestFactory
from apps.auth.views import verify_otp
import json

# Create a test request
factory = RequestFactory()
request = factory.post('/api/auth/verify-otp/', {
    'phone': '+79991234567',
    'otp_code': '000000',
    'device_info': 'test'
}, content_type='application/json')

print("Testing /api/auth/verify-otp/...")
try:
    response = verify_otp(request)
    print(f"Status: {response.status_code}")
    if hasattr(response, 'data'):
        print(f"Response: {json.dumps(response.data, indent=2, ensure_ascii=False)}")
    else:
        print(f"Response: {response.content.decode()}")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
