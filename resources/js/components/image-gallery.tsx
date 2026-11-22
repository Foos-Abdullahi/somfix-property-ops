import { useState } from 'react';

export function ImageGallery({ images }: { images?: string[] | null }) {
    const [open, setOpen] = useState<string | null>(null);
    if (!images || images.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">No images added.</p>
        );
    }
    return (
        <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((src) => (
                    <li key={src}>
                        <button
                            type="button"
                            onClick={() => setOpen(src)}
                            className="block aspect-square w-full overflow-hidden rounded-xl border border-border/70"
                        >
                            <img
                                src={src}
                                alt=""
                                className="size-full object-cover"
                            />
                        </button>
                    </li>
                ))}
            </ul>
            {open && (
                <div
                    role="dialog"
                    onClick={() => setOpen(null)}
                    className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
                >
                    <img
                        src={open}
                        alt=""
                        className="max-h-full max-w-full rounded-lg"
                    />
                </div>
            )}
        </>
    );
}
