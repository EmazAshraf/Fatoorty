# QR Code Configuration

## Overview
This document explains how to configure the frontend URL used for generating table QR codes in the Fatrooty restaurant management system.

## Configuration Options

### 1. Environment Variables
The system uses the following environment variables (in order of priority):

- `FRONTEND_URL` - Primary configuration for frontend URL
- `CORS_ORIGIN` - Fallback if FRONTEND_URL is not set
- Default: `http://localhost:3000` (hardcoded fallback)

### 2. Setting the Frontend URL

#### For Development:
```bash
# In your .env file
FRONTEND_URL=http://localhost:3000
```

#### For Production:
```bash
# In your .env file
FRONTEND_URL=https://yourdomain.com
```

#### For Staging:
```bash
# In your .env file
FRONTEND_URL=https://staging.yourdomain.com
```

## How It Works

1. **QR Code Generation**: When creating or updating tables, the system calls `getFrontendOrigin()` function
2. **URL Construction**: The function returns the configured frontend URL
3. **QR Code Creation**: QR codes are generated with URLs like:
   ```
   {FRONTEND_URL}/menu?restaurantId={id}&tableId={id}&tableNumber={number}&v={timestamp}
   ```

## QR Code Management

QR codes are automatically generated when tables are created and cannot be regenerated after creation. If you need to change the URL structure, you must:

1. Update the environment variables
2. Delete and recreate the affected tables
3. Or modify the backend code to change the URL generation logic

## Troubleshooting

### Issue: QR codes still showing old URL
**Solution**: 
1. Check your environment variables are set correctly
2. Delete and recreate the affected tables to get new QR codes
3. Restart your backend server after changing environment variables

### Issue: QR codes pointing to wrong domain
**Solution**:
1. Verify `FRONTEND_URL` environment variable is set correctly
2. Ensure the URL includes the protocol (http:// or https://)
3. Regenerate all QR codes after fixing the configuration

## Example Environment Configuration

```bash
# Development
FRONTEND_URL=http://localhost:3000

# Production
FRONTEND_URL=https://fatoorty.com

# Staging
FRONTEND_URL=https://staging.fatoorty.com
```

## Security Notes

- The `FRONTEND_URL` should point to your legitimate frontend application
- Avoid using placeholder URLs in production
- Consider using different URLs for different environments (dev/staging/prod)


