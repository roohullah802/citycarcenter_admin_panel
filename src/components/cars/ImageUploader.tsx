'use client'

import React, { useRef, useState } from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';
import { api } from '@/lib/axios';
import { Loader2, X, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!;

const authenticator = async () => {
  try {
    console.log('Fetching ImageKit signature...');
    const response = await api.get('/users/signature');
    console.log('Signature response:', response.data);
    const { signature, expire, token } = response.data.imagekit_signature;
    return { signature, expire, token };
  } catch (error: any) {
    console.error('ImageKit authentication error:', error);
    throw new Error(error.message);
  }
};

interface ImageUploaderProps {
  onSuccess: (res: { url: string; fileId: string }) => void;
  multiple?: boolean;
}

export function ImageUploader({ onSuccess, multiple = false }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const ikUploadRef = useRef<HTMLInputElement>(null);

  const onError = (err: any) => {
    setIsUploading(false);
    console.error('IKUpload Error:', err);
    toast.error(`Upload failed: ${err.message || 'Unknown error'}`);
  };

  const onUploadSuccess = (res: any) => {
    setIsUploading(false);
    toast.success('Image uploaded successfully');
    onSuccess({ url: res.url, fileId: res.fileId });
  };

  const onUploadStart = () => {
    setIsUploading(true);
  };

  return (
    <div className="w-full">
      <IKContext
        publicKey={publicKey}
        urlEndpoint={urlEndpoint}
        authenticator={authenticator}
      >
        <div
          className="relative border-2 border-dashed border-surface-800 rounded-2xl p-10 hover:bg-surface-900/50 hover:border-brand-500/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group shadow-inner bg-surface-900/20"
          onClick={() => ikUploadRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
                <div className="absolute inset-0 blur-lg bg-brand-500/20 animate-pulse"></div>
              </div>
              <span className="text-sm font-bold text-surface-400 tracking-wider">UPLOADING ASSETS...</span>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-surface-800 text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-all mb-4 border border-surface-700">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-surface-200">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-widest">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
              <IKUpload
                ref={ikUploadRef}
                style={{ display: 'none' }}
                onError={onError}
                onSuccess={onUploadSuccess}
                onUploadStart={onUploadStart}
                useUniqueFileName={true}
                folder="/cars"
                multiple={multiple}
              />
            </>
          )}
        </div>
      </IKContext>
    </div>
  );
}
