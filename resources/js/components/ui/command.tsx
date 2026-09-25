import * as React from 'react';

export const Command = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => <div className={className}>{children}</div>;
export const CommandInput = (props: React.ComponentProps<'input'>) => <input {...props} />;
export const CommandList = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const CommandEmpty = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const CommandGroup = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
export const CommandSeparator = () => <div className="my-1 h-px bg-border" />;
export const CommandItem = ({ children, onSelect, className }: React.PropsWithChildren<{ onSelect?: () => void; className?: string }>) => <button type="button" className={className} onClick={onSelect}>{children}</button>;
