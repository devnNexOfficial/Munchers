/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
// import { supabase } from '@/lib/supabase'; // Replace with actual Supabase client import

interface ImageUploadFieldProps {
  bucket: 'menu-images' | 'ingredient-pngs';
  label: string;
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUploadField({ bucket, label, value, onChange }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size (200KB)
    if (file.size > 200 * 1024) {
      setError('File size exceeds 200KB limit.');
      return;
    }

    // Validate type
    if (bucket === 'ingredient-pngs' && file.type !== 'image/png') {
      setError('Ingredients must be PNG format.');
      return;
    }
    if (bucket === 'menu-images' && !['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Menu images must be PNG or JPEG.');
      return;
    }

    setIsUploading(true);
    try {
      // Dummy upload logic. Replace with actual Supabase Storage upload.
      /*
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);
      if (uploadError) throw uploadError;

      // For public bucket, get public URL. For private, just store the path and use signed URL on fetch.
      if (bucket === 'menu-images') {
        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        onChange(data.publicUrl);
      } else {
        onChange(filePath);
      }
      */
      
      // MOCK URL for demonstration
      onChange(`mock-url-for-${file.name}`);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-xs text-gray-500 font-normal">({bucket === 'ingredient-pngs' ? 'PNG only' : 'PNG/JPG'}, Max 200KB)</span>
      </label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
            {/* Note: If bucket is private, this should ideally be a signed URL fetched via useEffect. 
                Assuming 'value' passed here is a usable URL or we mock it for now. */}
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept={bucket === 'ingredient-pngs' ? 'image/png' : 'image/png,image/jpeg'}
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-[#FAFAFA] file:text-gray-700
              hover:file:bg-gray-100 border border-gray-300 rounded-lg cursor-pointer"
          />
          {isUploading && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
          {error && <p className="text-xs text-[#D62828] mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
