"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface BeatOption {
  id: string;
  name: string;
  code?: string;
}

export default function ComboboxBeats({
  value,
  onChange,
  options,
  placeholder = "Select a beat...",
  disabled = false,
}: {
  value: string;
  onChange: (id: string) => void;
  options: BeatOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedBeat = options.find((o) => o.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
          disabled={disabled}
        >
          {selectedBeat
            ? `${selectedBeat.name}${selectedBeat.code ? ` (${selectedBeat.code})` : ""}`
            : placeholder}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Search beats..." />
          <CommandEmpty>No beats found.</CommandEmpty>
          <CommandGroup>
            {options.map((o) => (
              <CommandItem
                key={o.id}
                value={`${o.name} ${o.code || ""}`.trim()}
                onSelect={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === o.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="font-medium">{o.name}</span>
                {o.code && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({o.code})
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
