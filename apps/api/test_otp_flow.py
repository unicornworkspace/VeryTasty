import os
import django
os.environ['DJANGO_SETTINGS_MODULE'] = 'api.settings.local'
django.setup()

from apps.auth.services import create_otp_session, verify_otp_session

print("Creating OTP session...")
session = create_otp_session('+79991234567')
print(f"Session created for phone: {session.phone}")
print(f"Plain OTP: {session._plain_otp}")
print(f"OTP Hash: {session.otp_hash}")

print("\nVerifying OTP...")
try:
    verified = verify_otp_session('+79991234567', '000000')
    print(f"Verified: {verified}")
except ValueError as e:
    print(f"Error: {e}")
