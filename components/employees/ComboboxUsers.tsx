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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserOption {
  id: string;
  name?: string;
  email?: string;
  profileImage?: string;
}

export default function ComboboxUsers({
  value,
  onChange,
  options,
  placeholder = "Select a user...",
  disabled = false,
  showAllOption = false,
}: {
  value: string;
  onChange: (id: string) => void;
  options: UserOption[];
  placeholder?: string;
  disabled?: boolean;
  showAllOption?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const selectedUser = options.find((o) => o.id === value);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  const getDisplayName = (user: UserOption) => {
    return user.name || user.email || user.id;
  };

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
          {selectedUser ? getDisplayName(selectedUser) : placeholder}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>No users found.</CommandEmpty>
          <CommandGroup>
            {showAllOption && (
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange("all");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "all" ? "opacity-100" : "opacity-0"
                  )}
                />
                All users
              </CommandItem>
            )}
            {options.map((o) => (
              <CommandItem
                key={o.id}
                value={`${o.name || ""} ${o.email || ""} ${o.id}`.trim()}
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
                <Avatar className="w-5 h-5 mr-2">
                  <AvatarImage src={o.profileImage} alt={getDisplayName(o)} />
                  <AvatarFallback className="text-xs">
                    {getInitials(o.name, o.email)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{o.name || o.email || o.id}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
