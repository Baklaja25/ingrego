"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, Loader2, AlertCircle } from "lucide-react"
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
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkCameraPermission = useCallback(async () => {
    setIsRequestingPermission(true)
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      // Clear any existing srcObject
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      
      if (videoRef.current) {
        const video = videoRef.current
        video.srcObject = stream
        streamRef.current = stream
        setHasPermission(true)
        setCameraError(null)

        // Try to play immediately
        video.play().catch((err) => {
          console.error("Error playing video:", err)
        })
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
    } finally {
      setIsRequestingPermission(false)
    }
  }, [])

  // Camera setup - initialize when tab is active
  useEffect(() => {
    if (activeTab === "camera" && hasPermission === null && !capturedImage) {
      // Small delay to ensure video element is mounted in DOM
      const timer = setTimeout(() => {
        if (videoRef.current) {
      checkCameraPermission()
        }
      }, 200)
      return () => clearTimeout(timer)
    }

    // Cleanup stream when tab changes away from camera
    if (activeTab !== "camera" && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      setHasPermission(null)
    }

    return () => {
      // Cleanup stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [activeTab, hasPermission, capturedImage, checkCameraPermission])

  // Additional effect to handle video element ready state
  useEffect(() => {
    if (activeTab === "camera" && videoRef.current && hasPermission) {
      const video = videoRef.current
      
      const handleCanPlay = () => {
        // Video is ready to play - ensure it's playing
        if (video.paused && video.readyState >= 2) {
          video.play().catch((err) => {
            console.error("Error playing video:", err)
          })
        }
      }

      // Only add listener if video has srcObject
      if (video.srcObject) {
        video.addEventListener("canplay", handleCanPlay)
        
        // Try to play immediately if already ready
        if (video.readyState >= 2) {
          video.play().catch((err) => {
            console.error("Error playing video immediately:", err)
          })
        }
      }

      return () => {
        video.removeEventListener("canplay", handleCanPlay)
      }
    }
  }, [activeTab, hasPermission])

  const handleCameraClick = () => {
    setActiveTab("camera")
    if (hasPermission === null && !capturedImage) {
      checkCameraPermission()
    }
  }

  const handleUploadClick = () => {
    setActiveTab("upload")
    fileInputRef.current?.click()
  }

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

  const resetCamera = async () => {
    setCapturedImage(null)
    setImageUrl(null)
    setIngredients([])
    setCameraError(null)
    
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    // Reset permission state and reinitialize camera
    setHasPermission(null)
    
    // Small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 100))
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
    <div className="space-y-3">
      {/* Primary Action Buttons */}
      <div className="space-y-3">
        {/* Scan with Camera Button */}
        <Button
          type="button"
          onClick={handleCameraClick}
          className="w-full min-h-[56px] bg-[#FF8C42] hover:bg-[#ff7b22] text-white text-base font-medium rounded-xl shadow-sm flex items-center justify-center gap-2"
        >
          <Camera className="h-5 w-5" />
          Scan with camera
        </Button>

        {/* Upload Photo Button */}
        <Button
          type="button"
          onClick={handleUploadClick}
          variant="outline"
          className="w-full min-h-[56px] bg-white border border-slate-200 text-[#0F172A] text-base font-medium rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Upload photo
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/heic"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera Permission / Error States */}
      {activeTab === "camera" && (
        <div className="space-y-3">
          {/* Requesting Permission State */}
          {isRequestingPermission && (
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <Loader2 className="h-4 w-4 animate-spin text-[#FF8C42]" />
              <span>Opening camera…</span>
            </div>
          )}

          {/* Camera Error State */}
          {cameraError && !isRequestingPermission && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-800">
                  {cameraError}
                </p>
                <Button
                  type="button"
                  onClick={checkCameraPermission}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-red-200 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Camera Preview / Video Feed */}
          {hasPermission && !cameraError && !capturedImage && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <motion.video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Capture Button Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  disabled={isDetecting}
                  className="h-14 w-14 rounded-full bg-white border-4 border-[#FF8C42] shadow-lg hover:bg-slate-50 disabled:opacity-50"
                  aria-label="Capture photo"
                >
                  {isDetecting ? (
                    <Loader2 className="h-6 w-6 animate-spin text-[#FF8C42]" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-[#FF8C42]" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <Image
                          src={capturedImage}
                          alt="Captured"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          unoptimized
                        />
                        <button
                type="button"
                          onClick={resetCamera}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
                          aria-label="Retake photo"
                        >
                <X className="h-4 w-4 text-[#0F172A]" />
                        </button>
                </div>
                )}
              </div>
            )}

      {/* Upload Preview */}
      {activeTab === "upload" && imageUrl && (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={imageUrl}
                  alt="Uploaded"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
                  unoptimized
                />
                <button
            type="button"
                  onClick={() => {
                    setImageUrl(null)
                    setCapturedImage(null)
                    setIngredients([])
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""
                    }
                  }}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
                  aria-label="Remove image"
                >
            <X className="h-4 w-4 text-[#0F172A]" />
                </button>
        </div>
            )}

      {/* Detection Loading State */}
            {isDetecting && (
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
          <Loader2 className="h-4 w-4 animate-spin text-[#FF8C42]" />
          <span>Detecting ingredients…</span>
              </div>
            )}
    </div>
  )
}
