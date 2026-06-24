'use client'

import Image from 'next/image'
import { Upload, X } from 'lucide-react'

interface FeedbackPhotoUploadProps {
  photoPreview: string | null
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearPhoto: () => void
}

export function FeedbackPhotoUpload({
  photoPreview,
  onPhotoChange,
  onClearPhoto,
}: FeedbackPhotoUploadProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-700">Add a Photo (Optional)</label>
      {photoPreview ? (
        <div className="relative inline-block h-24 w-24">
          <Image
            src={photoPreview}
            alt="Feedback photo preview"
            width={200}
            height={200}
            className="h-24 w-24 rounded-lg object-cover"
          />
          <button
            onClick={onClearPhoto}
            className="absolute -right-2 -top-2 rounded-full bg-red-100 p-1 text-muncherz-red"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
          <Upload className="mb-1 h-6 w-6 text-gray-400" />
          <span className="text-xs text-gray-500">Upload</span>
          <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
        </label>
      )}
    </div>
  )
}
