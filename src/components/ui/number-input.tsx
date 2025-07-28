import * as React from "react"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: number
  onChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  precision?: number
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value = 0, onChange, min = 0, max, step = 1, precision = 1, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value.toString())

    React.useEffect(() => {
      setInternalValue(value.toString())
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Only allow numbers and decimal point
      const numericValue = inputValue.replace(/[^0-9.]/g, '')
      
      // Prevent multiple decimal points
      const parts = numericValue.split('.')
      const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue
      
      setInternalValue(cleanValue)
      
      // Only call onChange if it's a valid number
      const numValue = parseFloat(cleanValue)
      if (!isNaN(numValue)) {
        onChange?.(numValue)
      } else if (cleanValue === '') {
        onChange?.(0)
      }
    }

    const handleBlur = () => {
      // Ensure we have a valid number on blur
      const numValue = parseFloat(internalValue)
      if (isNaN(numValue)) {
        setInternalValue('0')
        onChange?.(0)
      } else {
        // Apply min/max constraints
        let constrainedValue = numValue
        if (min !== undefined && constrainedValue < min) constrainedValue = min
        if (max !== undefined && constrainedValue > max) constrainedValue = max
        
        setInternalValue(constrainedValue.toString())
        onChange?.(constrainedValue)
      }
    }

    return (
      <input
        type="text"
        inputMode="decimal"
        className={cn(
          "flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          // Hide number input spinners
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        ref={ref}
        value={internalValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }