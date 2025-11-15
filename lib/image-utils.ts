/**
 * Downscale image to max 1024px on longest edge and strip metadata
 */
export async function downscaleImage(
  imageDataUrl: string,
  maxSize: number = 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }

      // Calculate new dimensions
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and convert to JPEG (strips metadata)
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convert to JPEG with quality 0.85 (good balance)
      const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.85)
      resolve(jpegDataUrl)
    }
    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }
    img.src = imageDataUrl
  })
}


