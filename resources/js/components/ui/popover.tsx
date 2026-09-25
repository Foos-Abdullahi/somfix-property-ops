import * as React from 'react';

export const Popover = ({ children }: React.PropsWithChildren) => <>{children}</>;
export const PopoverTrigger = ({ children }: React.PropsWithChildren) => <>{children}</>;
export const PopoverContent = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>;
