"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BeatOption {
  id: string;
  name: string;
  code?: string;
}

export default function MultiSelectComboboxBeats({
  value,
  onChange,
  options,
  placeholder = "Select beats...",
  disabled = false,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  options: BeatOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedBeats = options.filter((o) => value.includes(o.id));

  const handleSelect = (beatId: string) => {
    if (value.includes(beatId)) {
      onChange(value.filter((id) => id !== beatId));
    } else {
      onChange([...value, beatId]);
    }
  };

  const handleRemove = (
    beatId: string,
    e?: React.MouseEvent | React.KeyboardEvent
  ) => {
    e?.stopPropagation();
    e?.preventDefault();
    onChange(value.filter((id) => id !== beatId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full min-h-10 h-auto"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedBeats.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedBeats.map((beat) => (
                <Badge
                  key={beat.id}
                  variant="secondary"
                  className="mr-1 mb-1"
                  onClick={(e) => handleRemove(beat.id, e)}
                >
                  {beat.name}
                  {beat.code && ` (${beat.code})`}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleRemove(beat.id, e);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => handleRemove(beat.id, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width]"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search beats..." />
          <CommandList>
            <CommandEmpty>No beats found.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.name}
                  onSelect={() => handleSelect(o.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(o.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {o.name}
                  {o.code && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({o.code})
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
