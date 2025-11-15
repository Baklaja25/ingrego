# OpenAI Vision API Integration

This document describes the OpenAI Vision API integration for ingredient detection from images.

## Environment Variables

Add the following to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

You can get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

## Usage

### API Endpoint

**POST** `/api/scan/ingredients`

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",  // Optional: Remote image URL
  "imageBase64": "data:image/jpeg;base64,..."   // Optional: Base64 encoded image
}
```

**Response:**
```json
{
  "ingredients": ["tomato", "onion", "chicken", ...]
}
```

### Client Helper

Use the `detectIngredients` helper function:

```typescript
import { detectIngredients } from "@/lib/detectIngredients"

const ingredients = await detectIngredients({
  imageBase64: "data:image/jpeg;base64,..."
})
```

### Cost Controls

The implementation includes several cost optimization features:

1. **Image Downscaling**: Images are automatically downscaled to max 1024px on the longest edge before sending to OpenAI
2. **Metadata Stripping**: Images are converted to JPEG format, removing metadata
3. **Timeout**: 3-second timeout per request
4. **Retry Logic**: Automatic retry once on failure
5. **Model Selection**: Uses `gpt-4o-mini` (lowest cost vision model)

### Error Handling

The API handles various error scenarios:

- **401**: Invalid API key
- **408**: Request timeout
- **429**: Rate limit exceeded
- **500**: Internal server error

All errors are returned with helpful error messages.

### Structured Outputs

The API uses OpenAI's Structured Outputs feature with JSON Schema to ensure consistent response format:

```json
{
  "type": "object",
  "properties": {
    "ingredients": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "confidence": { "type": "number" },
          "state": { "type": "string" },
          "packaged": { "type": "boolean" },
          "brand": { "type": "string" },
          "notes": { "type": "string" }
        },
        "required": ["name", "confidence"]
      }
    }
  },
  "required": ["ingredients"]
}
```

### Example Usage in Scan Page

The scan page automatically:

1. Captures/uploads an image
2. Downscales the image to reduce costs
3. Calls the detection API
4. Populates the ingredient store
5. Shows success/error toasts

No additional code is needed - it works out of the box!

## Testing

To test the integration:

1. Add your OpenAI API key to `.env.local`
2. Navigate to `/scan` page
3. Upload or capture an image
4. Wait for ingredient detection (usually 1-3 seconds)
5. Review detected ingredients

## Fallback Behavior

If the OpenAI API is not configured or fails:

- The API returns an error message
- The client shows a toast notification
- The ingredient list remains empty
- Users can manually add ingredients

## Cost Estimation

Using `gpt-4o-mini` with downscaled images (1024px max):

- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Average cost per image**: ~$0.001-0.005 (depending on image complexity)

For 1000 images: ~$1-5


