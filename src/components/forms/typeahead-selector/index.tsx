import React, { useState, forwardRef, useEffect } from "react";
import { classNames } from "@jambonz/ui-kit";
import { Icons } from "src/components/icons";

import "./styles.scss";

/**
 * Represents an option in the typeahead selector dropdown
 * @interface TypeaheadOption
 * @property {string} name - The display text shown in the dropdown
 * @property {string} value - The underlying value used when the option is selected
 */
export interface TypeaheadOption {
  name: string;
  value: string;
}

/**
 * Props for the TypeaheadSelector component
 * @extends {JSX.IntrinsicElements["input"]} - Inherits all standard HTML input props
 * @typedef TypeaheadSelectorProps
 * @property {TypeaheadOption[]} options - Array of selectable options to display in the dropdown
 * @property {string} [className] - Optional CSS class name to apply to the component
 */
type TypeaheadSelectorProps = JSX.IntrinsicElements["input"] & {
  options: TypeaheadOption[];
  className?: string;
};

type TypeaheadSelectorRef = HTMLInputElement;

/**
 * TypeaheadSelector - A searchable dropdown component with keyboard navigation
 *
 * @component
 * @param {Object} props
 * @param {string} props.id - Unique identifier for the input
 * @param {string} props.name - Form field name
 * @param {string} props.value - Currently selected value
 * @param {TypeaheadOption[]} props.options - Array of selectable options
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {Function} props.onChange - Callback when selection changes
 * @param {Ref} ref - Forwarded ref for the input element
 *
 * Features:
 * - Keyboard navigation (up/down arrows, enter to select, escape to close)
 * - Auto-scroll selected option into view
 * - Filtering options by typing
 * - Click or keyboard selection
 * - Maintains value synchronization with parent component
 * - Accessibility support with ARIA attributes
 */
export const TypeaheadSelector = forwardRef<
  TypeaheadSelectorRef,
  TypeaheadSelectorProps
>(
  (
    {
      id,
      name,
      value = "",
      options,
      disabled,
      onChange,
      className,
      ...restProps
    }: TypeaheadSelectorProps,
    ref,
  ) => {
    const [inputValue, setInputValue] = useState("");
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const classes = {
      "typeahead-selector": true,
      [`typeahead-selector${className}`]: true,
      focused: isOpen,
      disabled: !!disabled,
    };
    const [activeIndex, setActiveIndex] = useState(-1);

    /**
     * Synchronizes the input field with external value changes
     * - Updates the input value when the selected value changes externally
     * - Sets the input text to the name of the selected option
     * - Updates the active index to match the selected option
     * - Runs when either the value prop or options array changes
     */
    useEffect(() => {
      let selectedIndex = options.findIndex((opt) => opt.value === value);
      selectedIndex = selectedIndex < 0 ? 0 : selectedIndex;
      const selected = options[selectedIndex];
      setInputValue(selected?.name ?? "");
      setActiveIndex(selectedIndex);
    }, [value, options]);

    /**
     * Handles changes to the input field value
     * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
     *
     * - Updates the input field with user's typed value
     * - Opens the dropdown menu
     * - Shows all available options (unfiltered)
     * - Finds and highlights the first option that starts with the input text
     * - Scrolls the highlighted option into view
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setInputValue(input);
      setIsOpen(true);
      setFilteredOptions(options);

      const currentIndex = options.findIndex((opt) =>
        opt.name.toLowerCase().startsWith(input.toLowerCase()),
      );
      setActiveIndex(currentIndex);

      // Wait for dropdown to render, then scroll to the selected option
      setTimeout(() => {
        scrollActiveOptionIntoView(currentIndex);
      }, 0);
    };

    /**
     * Scrolls the option at the specified index into view within the dropdown
     * @param {number} index - The index of the option to scroll into view
     *
     * - Uses the option's ID to find its DOM element
     * - Smoothly scrolls the option into view if found
     * - Does nothing if the option element doesn't exist
     */
    const scrollActiveOptionIntoView = (index: number) => {
      const optionElement = document.getElementById(`${id}-option-${index}`);
      if (optionElement) {
        optionElement.scrollIntoView({ block: "nearest" });
      }
    };

    /**
     * Handles keyboard navigation and selection within the dropdown
     * @param {React.KeyboardEvent<HTMLInputElement>} e - Keyboard event
     *
     * Keyboard controls:
     * - ArrowDown/ArrowUp: Opens dropdown if closed, otherwise navigates options
     * - Enter: Selects the currently highlighted option
     * - Escape: Closes the dropdown
     *
     * Features:
     * - Prevents default arrow key scrolling behavior
     * - Auto-scrolls the active option into view
     * - Wraps navigation within available options
     * - Maintains current selection if at list boundaries
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setIsOpen(true);
          setFilteredOptions(options);
          return;
        }
      }
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => {
            const newIndex =
              prev < filteredOptions.length - 1 ? prev + 1 : prev;
            scrollActiveOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : prev;
            scrollActiveOptionIntoView(newIndex);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
            handleOptionSelect(filteredOptions[activeIndex], e);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    };

    /**
     * Handles the selection of an option from the dropdown
     * @param {TypeaheadOption} option - The selected option object
     * @param {React.MouseEvent | React.KeyboardEvent} e - Optional event object
     *
     * - Updates the input field with the selected option's name
     * - Closes the dropdown
     * - Triggers the onChange callback with a synthetic event containing the selected value
     */
    const handleOptionSelect = (
      option: TypeaheadOption,
      e?: React.MouseEvent | React.KeyboardEvent,
    ) => {
      e?.preventDefault();
      setInputValue(option.name);
      setIsOpen(false);
      if (onChange) {
        const syntheticEvent = {
          target: { value: option.value, name },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    /**
     * Handles the input focus event
     *
     * - Opens the dropdown menu
     * - Shows all available options (unfiltered)
     * - Finds and highlights the currently selected option based on value or input text
     * - Scrolls the highlighted option into view after dropdown renders
     *
     * Note: Uses setTimeout to ensure the dropdown is rendered before attempting to scroll
     */
    const handleFocus = () => {
      setIsOpen(true);
      setFilteredOptions(options);
      // Find and highlight the current value in the dropdown
      const currentIndex = options.findIndex(
        (opt) => opt.value === value || opt.name === inputValue,
      );
      setActiveIndex(currentIndex);

      // Wait for dropdown to render, then scroll to the selected option
      setTimeout(() => {
        scrollActiveOptionIntoView(currentIndex);
      }, 0);
    };

    /**
     * Handles the input blur (focus loss) event
     * @param {React.FocusEvent} e - The blur event object
     *
     * - Checks if focus is moving outside the component
     * - If focus leaves component:
     *   - Validates current input value against available options
     *   - Resets input to last valid selection if no match found
     *   - Closes the dropdown menu
     * - Preserves focus state if clicking within component (e.g., dropdown options)
     */
    const handleBlur = (e: React.FocusEvent) => {
      // Check if the new focus target is within our component
      const relatedTarget = e.relatedTarget as Node;
      const container = inputRef.current?.parentElement;

      if (!container?.contains(relatedTarget)) {
        // Reset value if it doesn't match any option
        const matchingOption = options.find(
          (opt) => opt.name.toLowerCase() === inputValue.toLowerCase(),
        );
        if (!matchingOption) {
          const selected = options.find((opt) => opt.value === value);
          setInputValue(selected?.name || "");
        }
        setIsOpen(false);
      }
    };
    /**
     * Renders a typeahead selector component with dropdown functionality.
     *
     * Key features:
     * - Input field with autocomplete functionality
     * - Dropdown toggle button with chevron icons
     * - Dropdown list of filterable options
     * - Keyboard navigation support
     * - Accessibility attributes (ARIA)
     *
     * Component Structure:
     * 1. Input field:
     *    - Handles text input, focus/blur events
     *    - Supports both function and object refs
     *    - Disables browser autocomplete features
     *
     * 2. Toggle button:
     *    - Opens/closes dropdown
     *    - Shows up/down chevron icons
     *    - Resets filtered options on click
     *    - Auto-scrolls to selected option
     *
     * 3. Dropdown menu:
     *    - Displays filtered options
     *    - Supports mouse and keyboard interaction
     *    - Highlights active option
     *    - Implements proper ARIA attributes for accessibility
     *
     * States managed:
     * - isOpen: Controls dropdown visibility
     * - activeIndex: Tracks currently focused option
     * - inputValue: Current input text
     * - filteredOptions: Available options based on input
     */
    return (
      <div className={classNames(classes)}>
        <input
          className={classNames({
            active: isOpen,
            disabled: !!disabled,
          })}
          ref={(node) => {
            // Handle both refs
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            inputRef.current = node;
          }}
          id={id}
          name={name}
          value={inputValue}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          {...restProps}
        />
        <span
          role="button"
          tabIndex={0}
          onBlur={handleBlur}
          className={classNames({
            active: isOpen,
            disabled: !!disabled,
            pointerevents: true,
          })}
          onClick={() => {
            setIsOpen(!isOpen);
            setFilteredOptions(options);
            const currentIndex = options.findIndex(
              (opt) => opt.value === value || opt.name === inputValue,
            );
            setActiveIndex(currentIndex);

            // Wait for dropdown to render, then scroll to the selected option
            setTimeout(() => {
              scrollActiveOptionIntoView(currentIndex);
            }, 0);
          }}
          onKeyDown={handleKeyDown}
        >
          <Icons.ChevronUp />
          <Icons.ChevronDown />
        </span>

        {isOpen && (
          <div
            className="typeahead-dropdown"
            role="listbox"
            id={`${id}-listbox`}
          >
            {filteredOptions.map((option, index) => (
              <div
                key={`${id}_${option.value}`}
                className={classNames({
                  "typeahead-option": true,
                  active: index === activeIndex,
                })}
                role="option"
                id={`${id}-option-${index}`}
                aria-selected={index === activeIndex}
                tabIndex={-1}
                onMouseDown={() => handleOptionSelect(option)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {option.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
);

TypeaheadSelector.displayName = "TypeaheadSelector";
