import imageCompression from 'browser-image-compression'
import { supabase } from './supabase'

export async function uploadPhoto(
  file: File,
  bucket: string,
  workshopId: string,
): Promise<string> {
  const small = await imageCompression(file, {
    maxWidthOrHeight: 800,
    maxSizeMB: 0.2,
    useWebWorker: true,
  })
  const path = `${workshopId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from(bucket).upload(path, small, {
    contentType: 'image/jpeg',
  })
  if (error) throw error
  return path
}

const cache = new Map<string, string>()

export async function signedUrl(bucket: string, path: string): Promise<string> {
  const key = `${bucket}/${path}`
  const hit = cache.get(key)
  if (hit) return hit
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 3600)
  if (data?.signedUrl) cache.set(key, data.signedUrl)
  return data?.signedUrl ?? ''
}