"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, Loader2 } from "lucide-react"
import { useScanStore } from "@/stores/scan-store"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { detectIngredients } from "@/lib/detectIngredients"
import { downscaleImage } from "@/lib/image-utils"
import Image from "next/image"

export function ScanTabs() {
  const {
    setCapturedImage,
    setImageUrl,
    setIngredients,
    capturedImage,
    imageUrl,
  } = useScanStore()
  const [activeTab, setActiveTab] = useState("camera")
  const [isDetecting, setIsDetecting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setHasPermission(true)
        setCameraError(null)
      }
    } catch (error: any) {
      setHasPermission(false)
      if (error.name === "NotAllowedError") {
        setCameraError("Camera permission denied. Please allow camera access.")
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found on this device.")
      } else {
        setCameraError("Failed to access camera. Please try again.")
      }
    }
  }, [])

  // Camera setup
  useEffect(() => {
    if (activeTab === "camera" && hasPermission === null && !capturedImage) {
      checkCameraPermission()
    }

    return () => {
      // Cleanup stream when component unmounts or tab changes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }, [activeTab, hasPermission, capturedImage, checkCameraPermission])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL("image/jpeg")
      setCapturedImage(imageData)
      setImageUrl(imageData)
      
      // Stop video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Detect ingredients
      detectIngredientsFromImage(imageData)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or HEIC image")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const imageData = reader.result as string
      setImageUrl(imageData)
      setCapturedImage(imageData)
      detectIngredientsFromImage(imageData)
    }
    reader.readAsDataURL(file)
  }

  const detectIngredientsFromImage = async (imageDataUrl: string, retryCount = 0) => {
    setIsDetecting(true)
    try {
      // Downscale image to reduce costs
      const downscaledImage = await downscaleImage(imageDataUrl, 1024)
      
      // Extract base64 data
      const base64Data = downscaledImage.split(",")[1] || downscaledImage

      // Call detection API with retry logic
      const ingredients = await detectIngredients({
        imageBase64: base64Data,
      })

      setIngredients(ingredients)
      toast.success(`Detected ${ingredients.length} ingredient${ingredients.length !== 1 ? "s" : ""}`)
    } catch (error: any) {
      // Retry once if not already retried
      if (retryCount < 1) {
        console.log("Retrying ingredient detection...")
        await new Promise((resolve) => setTimeout(resolve, 500))
        return detectIngredientsFromImage(imageDataUrl, retryCount + 1)
      }

      // Show error message
      const errorMessage = error.message || "Failed to detect ingredients"
      
      // Check if it's an API key issue
      if (errorMessage.includes("API key") || errorMessage.includes("not configured")) {
        toast.error("OpenAI API key is not configured. Please add OPENAI_API_KEY to your .env file.")
      } else if (errorMessage.includes("timeout")) {
        toast.error("Request timed out. Please try again.")
      } else {
        toast.error(errorMessage)
      }

      // Fallback to empty list
      setIngredients([])
    } finally {
      setIsDetecting(false)
    }
  }

  const resetCamera = () => {
    setCapturedImage(null)
    setImageUrl(null)
    setIngredients([])
    setCameraError(null)
    setHasPermission(null)
    checkCameraPermission()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string
        setImageUrl(imageData)
        setCapturedImage(imageData)
        detectIngredientsFromImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="camera">
          <Camera className="mr-2 h-4 w-4" />
          Camera
        </TabsTrigger>
        <TabsTrigger value="upload">
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </TabsTrigger>
      </TabsList>

      <TabsContent value="camera" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            {cameraError ? (
              <div className="text-center py-12 space-y-4">
                <p className="text-sm text-destructive">{cameraError}</p>
                <Button onClick={checkCameraPermission} variant="outline">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-muted">
                  <AnimatePresence mode="wait">
                    {capturedImage ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={capturedImage}
                          alt="Captured"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          unoptimized
                        />
                        <button
                          onClick={resetCamera}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                          aria-label="Retake photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.video
                        key="video"
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </AnimatePresence>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                {!capturedImage && (
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!hasPermission || isDetecting}
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-5 w-5" />
                        Capture Photo
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="upload" className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed rounded-2xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/heic"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm font-medium mb-2">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                JPG, PNG, or HEIC (max 10MB)
              </p>
              <Button variant="outline" type="button">
                Browse Files
              </Button>
            </div>
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 relative rounded-2xl overflow-hidden"
              >
                <Image
                  src={imageUrl}
                  alt="Uploaded"
                  width={1200}
                  height={900}
                  className="h-auto max-h-96 w-full object-contain"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
                <button
                  onClick={() => {
                    setImageUrl(null)
                    setCapturedImage(null)
                    setIngredients([])
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
            {isDetecting && (
              <div className="mt-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">
                  Detecting ingredients...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

