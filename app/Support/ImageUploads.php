<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Shared handling for the image upload component: a record keeps a list of
 * image URLs (external links or files stored on the public disk).
 */
class ImageUploads
{
    /** Validation rules for the `images` (kept URLs) and `new_images` (files) fields. */
    public static function rules(int $max = 10): array
    {
        return [
            'images' => ['nullable', 'array', 'max:'.$max],
            'images.*' => ['string', 'max:2048', 'regex:#^(https?://|/storage/)#i'],
            'new_images' => ['nullable', 'array', 'max:'.$max],
            'new_images.*' => ['image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
        ];
    }

    public static function messages(): array
    {
        return [
            'images.*.regex' => 'Image links must start with http:// or https://.',
            'new_images.*.image' => 'Each file must be an image.',
            'new_images.*.mimes' => 'Images must be JPG, PNG, WEBP or GIF.',
            'new_images.*.max' => 'Each image must be 5 MB or smaller.',
        ];
    }

    /** Delete the stored files of a record that is being removed. */
    public static function purge(?array $images): void
    {
        foreach ($images ?? [] as $url) {
            if (str_starts_with($url, '/storage/')) {
                Storage::disk('public')->delete(substr($url, strlen('/storage/')));
            }
        }
    }

    /**
     * Apply the submitted images to a record's data and delete files that were removed.
     *
     * @param  array<string, mixed>  $data  validated data
     * @param  list<string>  $previous  images the record had before
     * @param  list<UploadedFile>  $files
     * @return array<string, mixed>
     */
    public static function apply(array $data, array $previous, array $files, string $directory): array
    {
        $kept = array_values(array_unique($data['images'] ?? []));
        // Only keep local files the record already owned.
        $kept = array_values(array_filter($kept, fn (string $url) => ! str_starts_with($url, '/storage/') || in_array($url, $previous, true)));

        foreach ($files as $file) {
            $kept[] = Storage::url($file->store($directory, 'public'));
        }

        foreach (array_diff($previous, $kept) as $removed) {
            if (str_starts_with($removed, '/storage/')) {
                Storage::disk('public')->delete(substr($removed, strlen('/storage/')));
            }
        }

        unset($data['new_images']);
        $data['images'] = $kept;

        return $data;
    }
}
