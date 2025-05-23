
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
import { useState } from "react";

export interface Format {
  value: string;
  label: string;
}

interface FormatSelectorProps {
  formats: Format[];
  selectedFormat: string;
  onFormatChange: (value: string) => void;
  label: string;
}

const FormatSelector = ({
  formats = [],
  selectedFormat,
  onFormatChange,
  label,
}: FormatSelectorProps) => {
  const [open, setOpen] = useState(false);
  
  // Ensure formats is always an array, even if undefined is passed
  const formatOptions = Array.isArray(formats) ? formats : [];

  // Find the selected format or use a default label
  const selectedLabel = formatOptions.find((format) => format.value === selectedFormat)?.label || "Select format...";

  return (
    <div className="flex flex-col space-y-1.5 pt-10">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
          >
            {selectedLabel}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          {/* Key fix: Rendering null when popover is closed prevents cmdk from throwing errors */}
          {!open ? null : (
            <Command>
              <CommandInput placeholder="Search format..." />
              <CommandEmpty>No format found.</CommandEmpty>
              <CommandGroup>
                {formatOptions.length > 0 ? (
                  formatOptions.map((format) => (
                    <CommandItem
                      key={format.value}
                      value={format.value}
                      onSelect={() => {
                        onFormatChange(format.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedFormat === format.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {format.label}
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem disabled>No formats available</CommandItem>
                )}
              </CommandGroup>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FormatSelector;
