"use client";

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/src/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { useState, useRef, useCallback, type KeyboardEvent } from "react";

import { Check } from "lucide-react";
import { cn } from "@/src/utils/tailwind";

export type Option = Record<"value" | "label", string> & Record<string, string>;

type AutoCompleteProps = {
  options: Option[];
  value: Option;
  onValueChange?: (value: Option) => void;
  disabled?: boolean;
  placeholder?: string;
};

export const AutoComplete = ({
  options,
  placeholder,
  value,
  onValueChange,
  disabled,
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option>(value);
  const [inputValue, setInputValue] = useState<string>(value.label || "");

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true);
      }

      // This is not a default behaviour of the <input /> field
      if (event.key === "Enter" && input.value !== "") {
        const optionToSelect = options.find(
          (option) => option.label === input.value,
        );
        if (optionToSelect) {
          setSelected(optionToSelect);
          onValueChange?.(optionToSelect);
        }
      }

      if (event.key === "Escape") {
        input.blur();
      }
    },
    [isOpen, options, onValueChange],
  );

  const handleBlur = useCallback(() => {
    setOpen(false);
    setInputValue(selected.label);
  }, [selected]);

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label);

      setSelected(selectedOption);
      onValueChange?.(selectedOption);

      // This is a hack to prevent the input from being focused after the user selects an option
      // We can call this hack: "The next tick"
      setTimeout(() => {
        inputRef.current?.blur();
      }, 0);
    },
    [onValueChange],
  );

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="text-base"
        />
      </div>
      <div className="relative mt-1">
        {isOpen ? (
          <div className="absolute top-0 z-10 w-full rounded-xl bg-stone-50 outline-none animate-in fade-in-0 zoom-in-95">
            <CommandList className="rounded-lg ring-1 ring-slate-200">
              {options.length > 0 ? (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = selected.value === option.value;
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        onSelect={() => handleSelectOption(option)}
                        className={cn(
                          "flex w-full items-center gap-2",
                          !isSelected ? "pl-8" : null,
                        )}
                      >
                        {isSelected ? <Check className="w-4" /> : null}
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              <CommandItemCreate
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onSelect={() =>
                  handleSelectOption({ value: inputValue, label: inputValue })
                }
                {...{ inputValue, options }}
              />
            </CommandList>
          </div>
        ) : null}
      </div>
    </CommandPrimitive>
  );
};

const CommandItemCreate = ({
  inputValue,
  options,
  onSelect,
  onMouseDown,
}: {
  inputValue: string;
  options: Option[];
  onSelect: () => void;
  onMouseDown: (event: React.MouseEvent<HTMLElement>) => void;
}) => {
  const hasNoOption = !options
    .map(({ value }) => value)
    .includes(inputValue.toLowerCase());

  const render = inputValue !== "" && hasNoOption;

  if (!render) return null;

  return (
    <CommandItem
      key={inputValue}
      value={inputValue}
      className="text-muted-foreground"
      onSelect={onSelect}
      onMouseDown={onMouseDown}
    >
      <div className={cn("m-2 h-4 w-4")} />
      Create new prompt name: &quot;{inputValue}&quot;
    </CommandItem>
  );
};
