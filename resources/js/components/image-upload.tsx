import { ImagePlus, Link2, Plus, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

type Props = {
    label?: string;
    /** Images already saved (stored files or external links). */
    urls: string[];
    /** New files picked from the computer, not saved yet. */
    files: File[];
    onUrlsChange: (urls: string[]) => void;
    onFilesChange: (files: File[]) => void;
    multiple?: boolean;
    max?: number;
    /** Validation errors from the server. */
    error?: string;
    className?: string;
};

/**
 * Image picker with three ways to add pictures: upload from the computer,
 * drag and drop, or paste an image link. Supports several images.
 */
export function ImageUpload({
    label = 'Images',
    urls,
    files,
    onUrlsChange,
    onFilesChange,
    multiple = true,
    max = 10,
    error,
    className,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [link, setLink] = useState('');
    const [problem, setProblem] = useState<string>();

    const previews = useMemo(
        () => files.map((file) => URL.createObjectURL(file)),
        [files],
    );
    useEffect(
        () => () => previews.forEach((preview) => URL.revokeObjectURL(preview)),
        [previews],
    );

    const total = urls.length + files.length;
    const full = total >= max;

    const addFiles = (incoming: File[]) => {
        setProblem(undefined);
        const valid: File[] = [];
        let message: string | undefined;
        for (const file of incoming) {
            if (!ACCEPTED.includes(file.type)) {
                message = `"${file.name}" is not a JPG, PNG, WEBP or GIF image.`;
            } else if (file.size > MAX_SIZE) {
                message = `"${file.name}" is larger than 5 MB.`;
            } else {
                valid.push(file);
            }
        }
        let next = multiple ? [...files, ...valid] : valid.slice(0, 1);
        if (!multiple && valid.length > 0) {
            onUrlsChange([]);
        }
        const room = multiple ? max - urls.length : 1;
        if (next.length > room) {
            next = next.slice(0, room);
            message = `You can add up to ${max} images.`;
        }
        onFilesChange(next);
        setProblem(message);
    };

    const onPick = (event: ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(event.target.files ?? []));
        event.target.value = '';
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        addFiles(Array.from(event.dataTransfer.files));
    };

    const addLink = () => {
        const value = link.trim();
        if (value === '') {
            return;
        }
        if (!/^https?:\/\/\S+$/i.test(value)) {
            setProblem(
                'Enter a full image link starting with http:// or https://',
            );
            return;
        }
        if (urls.includes(value)) {
            setProblem('That link is already added.');
            return;
        }
        setProblem(undefined);
        if (!multiple) {
            onFilesChange([]);
            onUrlsChange([value]);
        } else if (full) {
            setProblem(`You can add up to ${max} images.`);
            return;
        } else {
            onUrlsChange([...urls, value]);
        }
        setLink('');
    };

    return (
        <div className={cn('space-y-3', className)}>
            <Label>{label}</Label>
            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => !full && inputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/80 bg-secondary/20 px-4 py-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/5',
                    dragging && 'border-primary bg-primary/10',
                    full && 'cursor-not-allowed opacity-60',
                )}
            >
                <UploadCloud className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                    Drag and drop {multiple ? 'images' : 'an image'} here, or{' '}
                    <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP or GIF, up to 5 MB each
                    {multiple ? `, max ${max} images` : ''}
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED.join(',')}
                    multiple={multiple}
                    onChange={onPick}
                    className="hidden"
                />
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={link}
                        placeholder="Or paste an image link (https://...)"
                        onChange={(event) => setLink(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                addLink();
                            }
                        }}
                        className="h-10 rounded-xl border-border/70 bg-background pl-9 shadow-none"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addLink}
                    disabled={link.trim() === ''}
                >
                    <Plus />
                    Add link
                </Button>
            </div>

            {total > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {urls.map((url) => (
                        <Thumb
                            key={url}
                            src={url}
                            onRemove={() =>
                                onUrlsChange(
                                    urls.filter((item) => item !== url),
                                )
                            }
                        />
                    ))}
                    {files.map((file, index) => (
                        <Thumb
                            key={`${file.name}-${index}`}
                            src={previews[index]}
                            badge="New"
                            onRemove={() =>
                                onFilesChange(
                                    files.filter((_, i) => i !== index),
                                )
                            }
                        />
                    ))}
                </ul>
            )}
            {total === 0 && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImagePlus className="size-4" /> No images added yet.
                </p>
            )}
            <InputError message={problem ?? error} />
        </div>
    );
}

function Thumb({
    src,
    onRemove,
    badge,
}: {
    src: string;
    onRemove: () => void;
    badge?: string;
}) {
    const [broken, setBroken] = useState(false);
    return (
        <li className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-secondary/30">
            {broken ? (
                <div className="flex size-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                    Image not available
                </div>
            ) : (
                <img
                    src={src}
                    alt=""
                    onError={() => setBroken(true)}
                    className="size-full object-cover"
                />
            )}
            {badge && (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {badge}
                </span>
            )}
            <button
                type="button"
                onClick={onRemove}
                aria-label="Remove image"
                className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow transition hover:bg-destructive hover:text-white"
            >
                <X className="size-3.5" />
            </button>
        </li>
    );
}
