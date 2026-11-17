import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Can } from '@/components/can';
import { Button } from '@/components/ui/button';

export function RowActions({ base, id, onDelete, canEdit = true, canDelete = true, extra }: { base: string; id: number | string; onDelete?: () => void; canEdit?: boolean; canDelete?: boolean; extra?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            <Button asChild size="icon" variant="ghost" className="size-8" title="View details">
                <Link href={`${base}/${id}`}>
                    <Eye className="size-4 text-muted-foreground" />
                </Link>
            </Button>
            {extra}
            <Can permission="finance.manage">
                {canEdit && (
                    <Button asChild size="icon" variant="ghost" className="size-8" title="Edit">
                        <Link href={`${base}/${id}/edit`}>
                            <Pencil className="size-4 text-primary" />
                        </Link>
                    </Button>
                )}
                {onDelete && canDelete && (
                    <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive" title="Delete" onClick={onDelete}>
                        <Trash2 className="size-4" />
                    </Button>
                )}
            </Can>
        </div>
    );
}
